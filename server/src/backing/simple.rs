use super::{Backing, UserBacking, Project, ProjectBrief, User, Ident};

use async_trait::async_trait;

use std::path::{Path, PathBuf};
use uuid::Uuid;

use serde::{Serialize, Deserialize};

use crate::fs::{Folder, File, Entry};

#[derive(Debug, Serialize, Deserialize)]
pub struct Manifest {
  name: String
}

impl Manifest {
  pub async fn read<P: AsRef<Path>>(path: P) -> anyhow::Result<Self> {
    let contents = tokio::fs::read_to_string(path).await?;
    Ok(serde_json::from_str(contents.as_str())?)
  }
}

pub struct SimpleProject {
  path: PathBuf
}

#[async_trait]
impl Project for SimpleProject {
  async fn uuid(&self) -> anyhow::Result<Uuid> {
    let file_name = self.path.file_name().unwrap().to_str().unwrap();
    Ok(Uuid::parse_str(file_name)?)
  }

  async fn name(&self) -> anyhow::Result<String> {
    Ok(Manifest::read(self.path.join("manifest.json")).await?.name)
  }

  async fn root(&self) -> anyhow::Result<Folder> {
    Ok(Folder::read(self.path).await?)
  }

  async fn mkdir(&mut self, path: PathBuf) -> anyhow::Result<()> {
    let mut root = self.path.clone();
    root.push(path);
    tokio::fs::create_dir_all(root).await?;
    Ok(())
  }

  async fn save(&mut self, path: PathBuf, contents: String) -> anyhow::Result<()> {
    tokio::fs::write(path, contents).await?;
    Ok(())
  }
}

pub struct SimpleUserBacking {
  path: PathBuf
}

#[async_trait]
impl UserBacking for SimpleUserBacking {
  async fn projects(&self) -> anyhow::Result<Vec<ProjectBrief>> {
    let mut ret = Vec::new();
    
    let read_dir = tokio::fs::read_dir(self.path).await?;
    
    while let Ok(Some(entry)) = read_dir.next_entry().await {
      ret.push(ProjectBrief {
        uuid: Uuid::parse_str(&entry.file_name().into_string().unwrap())?,
        name: Manifest::read(self.path.join("manifest.json")).await?.name
      });
    }

    Ok(ret)
  }

  async fn open_project(&mut self, uuid: Uuid) -> anyhow::Result<Box<dyn Project>> {
    Ok(Box::new(SimpleProject {
      path: self.path.join(format!("{}", uuid))
    }))
  }

  async fn close_project(&mut self, uuid: Uuid) -> anyhow::Result<()> {
    Ok(())
  }

  async fn logout(&mut self) -> anyhow::Result<()> {
    Ok(())
  }
}

pub struct SimpleBacking {
  path: PathBuf
}

#[async_trait]
impl Backing for SimpleBacking {
  async fn login(&mut self, user: User) -> anyhow::Result<Box<dyn UserBacking>> {
    Ok(Box::new(SimpleUserBacking {
      path: self.path.clone()
    }))
  }
}