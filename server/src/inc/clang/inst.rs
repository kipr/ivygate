

use tokio::sync::oneshot::Sender as OneshotSender;

use crate::inc::{Message, Severity, Index, Range};
use async_trait::async_trait;

use clang::{Clang, Index as CIndex, TranslationUnit, source::SourceRange, source::SourceLocation, diagnostic::{Diagnostic, Severity as DSeverity}};

use meio::{Actor, StartedBy, Context, ActionHandler, Action};

use std::path::{Path, PathBuf, Component};

use derive_more::*;
use lazy_static::lazy_static;

use tokio::sync::mpsc::{Receiver as MpscReceiver, Sender as MpscSender};

use std::convert::{TryInto, TryFrom};

#[derive(From, Display, Debug, Error)]
pub enum Error {
  #[error(ignore)]
  #[from]
  Internal(String)
}

pub enum Req {
  Compile {
    code: Option<String>,
    tx: OneshotSender<anyhow::Result<Vec<Message>>>
  }
}

impl<'a> From<SourceLocation<'a>> for Index {
  fn from(value: SourceLocation<'a>) -> Self {
    let loc = value.get_expansion_location();
    Self {
      line: loc.line as usize,
      col: loc.column as usize,
    }
  }
}

impl<'a> From<SourceRange<'a>> for Range {
  fn from(value: SourceRange) -> Self {
    Self {
      start: value.get_start().into(),
      end: value.get_end().into()
    }
  }
}

impl TryFrom<DSeverity> for Severity {
  type Error = ();

  fn try_from(value: DSeverity) -> Result<Self, ()> {
    match value {
      DSeverity::Error => Ok(Severity::Error),
      DSeverity::Warning => Ok(Severity::Warning),
      DSeverity::Note => Ok(Severity::Info),
      _ => Err(())
    }
  }
}

impl<'a> TryFrom<Diagnostic<'a>> for Message {
  type Error = ();
  fn try_from(value: Diagnostic) -> Result<Self, ()> {
    let severity: Severity = match value.get_severity().try_into() {
      Ok(v) => v,
      Err(e) => return Err(e)
    };

    Ok(Self {
      file: value.get_location().get_expansion_location().file.map(|f| f.get_path()),
      severity,
      ranges: value.get_ranges().into_iter().map(Into::into).collect(),
      message: value.get_text()
    })
  }
}


async fn compile<'a>(tu: &TranslationUnit<'a>) -> anyhow::Result<Vec<Message>> {
  let mut ret = Vec::new();
  
  for diagnostic in tu.get_diagnostics() {
    if let Ok(message) = diagnostic.try_into() {
      ret.push(message);
    }
  }

  Ok(ret)
}

lazy_static! {
  static ref CLANG: Clang = Clang::new().unwrap();

}

pub async fn instance<P: AsRef<Path>>(mut rx: MpscReceiver<Req>, path: P) -> anyhow::Result<()> {
  let path = path.as_ref();

  let tmp_dir = crate::fs::tmp_dir();
  
  let mut tmp_path = tmp_dir.clone();
  for c in path.components().filter(|c| match c {
    Component::RootDir | Component::Prefix(_) => false,
    _ => true
  }) {
    tmp_path.push(c);
  }

  {
    let mut dir = tmp_path.clone();
    dir.pop();
    tokio::fs::create_dir_all(dir).await?;
  }

  println!("{:?}", tmp_path);

  tokio::fs::copy(&path, &tmp_path).await?;

  let index = CIndex::new(&CLANG, true, false);
  let mut tu = index.parser(tmp_path).parse()?;

  while let Some(req) = rx.recv().await {
    match req {
      Req::Compile { code, tx } => {
        if let Some(code) = code {
          let _ = tokio::fs::write(path, code).await?;
        }

        tu = tu.reparse(&[])?;
        let _ = tx.send(compile(&tu).await);
      },
    }
  }

  Ok(())
}

