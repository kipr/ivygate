use std::fmt::Display;

struct Container<'a, T: Display>
{
  data: &'a T
}

impl<'a, T: Display> Container<'a, T> {
  pub fn new(data: &'a T) -> Self {
    Self {
      data
    }
  }

  pub fn print(&self) {
    println!("{}", self.data);
  }
}

pub fn asd<'a>() -> Container<'a, u32> {
  let x = 5;

  Container::new(&x)
}

enum MyEnum {
  Flag {
    my_value: u32,
    extra: String
  },
  Flag2
}

impl MyEnum {
  pub fn new() -> Self {
    Self::Flag2
  }

  pub fn my_value(&mut self) -> Option<u32> {
    match self {
      Self::Flag { my_value, extra } => Some(*my_value),
      _ => None
    };
    *self = Self::Flag2;
    None
  }
}

pub struct Test {
  pub a: u32,
  pub b: u32
}



fn test(flag: MyEnum) -> u32 {
  let mut a = MyEnum::new();

  println!("Hello, World!");
  match flag {
    MyEnum::Flag { my_value: 1, extra } => 1,
    MyEnum::Flag { my_value, extra } => my_value,
    MyEnum::Flag2 => 2,
    _ => 0
  }
}