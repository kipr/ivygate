use serde::{Serialize, Deserialize};
use std::collections::HashMap;

use std::path::{Path, PathBuf};

use std::future::Future;
use std::pin::Pin;

use derive_more::*;

#[derive(Display, Debug, Error)]
pub enum ReadError {
  UnsupportedEntry
}

#[derive(Debug, Serialize, Deserialize)]
pub struct File {
  contents: String
}

impl File {
  pub async fn read<P: AsRef<Path>>(path: P) -> anyhow::Result<Self> {
    let contents = tokio::fs::read_to_string(path).await?;
    
    Ok(Self {
      contents
    })
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Folder {
  entries: HashMap<String, Entry>
}

impl Folder {
  pub fn read<P: 'static + Send + Sync + AsRef<Path>>(path: P) -> Pin<Box<dyn Future<Output = anyhow::Result<Self>> + Send>> {
    Box::pin(async {
      let read_dir = tokio::fs::read_dir(&path).await?;
    
      let mut ret = Self {
        entries: HashMap::new()
      };

      while let Ok(Some(entry)) = read_dir.next_entry().await {
        let file_type = entry.file_type().await?;
        let file_name = entry.file_name().into_string().unwrap();

        if file_type.is_dir() {
          ret.entries.insert(file_name, Entry::Folder(Self::read(entry.path()).await?));
        } else if file_type.is_file() {
          ret.entries.insert(file_name, Entry::File(File::read(entry.path()).await?));
        }      
      }

      Ok(ret)
    })
    
  }
}

#[derive(From, Debug, Serialize, Deserialize)]
pub enum Entry {
  #[from]
  File(File),
  #[from]
  Folder(Folder)
}

impl Entry {
  pub async fn read<P: 'static + Send + Sync + AsRef<Path>>(path: P) -> anyhow::Result<Self> {
    let metadata = tokio::fs::metadata(&path).await?;
    let file_type = metadata.file_type();
    if file_type.is_dir() {
      Ok(Self::Folder(Folder::read(path).await?))
    } else if file_type.is_file() {
      Ok(Self::File(File::read(path).await?))
    } else {
      Err(ReadError::UnsupportedEntry.into())
    }
  }
}

pub fn tmp_dir() -> std::path::PathBuf {
  let mut dir = std::env::temp_dir();
  dir.push("ivygate");
  dir
}