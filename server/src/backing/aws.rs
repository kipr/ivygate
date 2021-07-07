use super::{Backing, UserBacking, Project};

use std::sync::Arc;

use uuid::Uuid;

pub struct AwsProject {

}

impl Project for AwsProject {
  
}

pub struct AwsUserBacking {

}

impl UserBacking for AwsUserBacking {
  async fn open_project(&mut self, uuid: Uuid) -> anyhow::Result<Box<dyn Project>> {
    
  }
}

pub struct AwsBacking {
  db: Arc<dynamodb::Client>
}

impl Backing for Aws {
  async fn login(&mut self, user: User) -> anyhow::Result<Box<dyn UserBacking>> {
    
  }
}