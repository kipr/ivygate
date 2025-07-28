import { User } from './user';

type Classroom = {
  name: string;
  users: User[];
}


namespace Classroom {
  export type Classroom = {
    name: string;
    users: User[];
  };
  
  export const EMPTY_CLASSROOM: Classroom = {
    name: '',
    users: []
  };

}

export default Classroom;