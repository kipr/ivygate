use async_trait::async_trait;

use std::path::{Path, PathBuf};
use std::ffi::OsStr;

use serde::{Serialize, Deserialize};

pub mod clang;

use derive_more::*;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Severity {
  Error,
  Warning,
  Info
}

/// A single "point" in a text document
#[derive(Debug, Serialize, Deserialize)]
pub struct Index {
  /// Line number (starting from 0)
  pub line: usize,

  /// Column offset (starting from 0)
  pub col: usize
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Range {
  /// Start index of the range
  pub start: Index,

  /// End index of the range
  pub end: Index,
}

/// A message that should be displayed to the user
#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
  pub file: Option<PathBuf>,

  /// The severity of the message
  pub severity: Severity,

  pub ranges: Vec<Range>,

  pub message: String
}

/// A single incremental-compiler "session". 1 session = 1 file
#[async_trait]
pub trait Session: Send + Sync {
  async fn mv(&mut self, path: PathBuf) -> anyhow::Result<()>;
  async fn update(&mut self, code: Option<String>) -> anyhow::Result<Vec<Message>>;
}

/// Represents an incremental compiler for user code
#[async_trait]
pub trait Inc: Send + Sync {
  /// Name of the incremental compiler (e.g., clang)
  fn name(&self) -> &str;

  /// The file extensions this incremental compiler supports.
  /// Must not contain leading dots (e.g., "c", not ".c")
  fn extensions(&self) -> &[&OsStr];

  /// Create a new session
  async fn start_session(&self, path: PathBuf) -> anyhow::Result<Box<dyn Session>>;
}

#[derive(Display, Debug, Error)]
pub enum SpawnError {
  NoInc
}


/// A factory for creating Incs based on file extension
pub struct IncSpawner {
  incs: Vec<Box<dyn Inc>>
}

impl IncSpawner {
  pub fn new() -> Self {
    Self {
      incs: vec! [
        Box::new(clang::ClangInc {})
      ]
    }
  }

  pub async fn spawn<P: AsRef<Path>>(&self, path: P) -> anyhow::Result<Box<dyn Session>> {
    let path = path.as_ref();
    let ext = path.extension().unwrap();

    for inc in self.incs.iter() {
      if !inc.extensions().contains(&ext) {
        continue
      }

      return inc.start_session(path.into()).await
    }
    
    Err(SpawnError::NoInc.into())
  }
}