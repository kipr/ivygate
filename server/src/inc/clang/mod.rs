use async_trait::async_trait;
use super::{Session, Inc, Message};
use meio::{System, Address};
use std::path::PathBuf;

use tokio::sync::oneshot::{channel as oneshot_channel};
use tokio::sync::mpsc::{channel as mpsc_channel, Sender as MpscSender};

use std::ffi::OsStr;

mod inst;

use lazy_static::lazy_static;

use inst::Req;

struct ClangSession {
  inst: MpscSender<Req>
}

impl ClangSession {
  pub fn new(inst: MpscSender<Req>) -> Self {
    Self {
      inst
    }
  }
}

#[async_trait]
impl Session for ClangSession {
  async fn mv(&mut self, path: PathBuf) -> anyhow::Result<()> {
    Ok(())
  }
  
  async fn update(&mut self, code: Option<String>) -> anyhow::Result<Vec<Message>> {
    let (tx, rx) = oneshot_channel();
    
    if let Err(_) = self.inst.send(Req::Compile { code, tx }).await {
      return Err(inst::Error::Internal("Failed to update".to_string()).into())
    }

    Ok(rx.await??)
  }
}

pub struct ClangInc {

}

lazy_static! {
  static ref EXTENSIONS: Vec<&'static OsStr> = vec! [
    OsStr::new("c"),
    OsStr::new("cc"),
    OsStr::new("cpp"),
    OsStr::new("cxx"),
    OsStr::new("h"),
    OsStr::new("hh"),
    OsStr::new("hpp"),
    OsStr::new("hxx")
  ];
}

impl ClangInc {
  
  
}

#[async_trait]
impl Inc for ClangInc {
  fn extensions(&self) -> &[&OsStr] {
    EXTENSIONS.as_ref()
  }

  fn name(&self) -> &str {
    "clang"
  }

  async fn start_session(&self, path: PathBuf) -> anyhow::Result<Box<dyn Session>> {
    let (tx, rx) = mpsc_channel(5);

    std::thread::spawn::<_, anyhow::Result<()>>(move || {
      let rt = tokio::runtime::Runtime::new()?;
      rt.block_on(inst::instance(rx, path))?;
      Ok(())
    });

    Ok(Box::new(ClangSession {
      inst: tx
    }))
  }
}

