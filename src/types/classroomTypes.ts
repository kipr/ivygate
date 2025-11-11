import { User } from './user';

type Classroom = {
  name: string;
  users: User[];
  classroomInvitationCode?: string;
}


namespace Classroom {
  export type Classroom = {
    name: string;
    users: User[];
    classroomInvitationCode?: string;
  };

  export const EMPTY_CLASSROOM: Classroom = {
    name: '',
    users: [],
    classroomInvitationCode: undefined
  };
  export const NO_CLASSROOM: Classroom = {
    name: 'No Classroom',
    users: [],
    classroomInvitationCode: undefined
  };
}

export default Classroom;