import LocalizedString from '../util/LocalizedString';
import { User } from './user';
import tr from '../i18n';

type Classroom = {
  name: string;
  users: User[];
  classroomInvitationCode?: string;
  type: "classroom";
}


namespace Classroom {
  export type Classroom = {
    name: string;
    users: User[];
    classroomInvitationCode?: string;
    type: "classroom";
  };

  export const EMPTY_CLASSROOM: Classroom = {
    name: '',
    users: [],
    classroomInvitationCode: undefined,
    type: "classroom"
  };
  export const NO_CLASSROOM: Classroom = {
    name: 'No Classroom',
    users: [],
    classroomInvitationCode: undefined,
    type: "classroom"
    
  };
}

export default Classroom;