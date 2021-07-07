use async_trait::async_trait;
use serde::{Serialize, Deserialize};

use crate::fs::Folder;

use uuid::Uuid;

use std::path::PathBuf;

mod simple;
mod aws;

use crate::proto::{User, ProjectBrief};

#[async_trait]
pub trait Project {
  async fn uuid(&self) -> anyhow::Result<Uuid>;
  async fn name(&self) -> anyhow::Result<String>;
  async fn root(&self) -> anyhow::Result<Folder>;

  async fn mkdir(&mut self, path: PathBuf) -> anyhow::Result<()>;
  async fn save(&mut self, path: PathBuf, contents: String) -> anyhow::Result<()>;  
}

#[async_trait]
pub trait UserBacking {
  async fn projects(&self) -> anyhow::Result<Vec<ProjectBrief>>;

  async fn open_project(&mut self, uuid: Uuid) -> anyhow::Result<Box<dyn Project>>;
  async fn close_project(&mut self, uuid: Uuid) -> anyhow::Result<()>;

  async fn logout(&mut self) -> anyhow::Result<()>;
}

#[async_trait]
pub trait Backing {
  async fn login(&mut self, user: User) -> anyhow::Result<Box<dyn UserBacking>>;
}