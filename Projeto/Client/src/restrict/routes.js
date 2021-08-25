import Restrict from './views/Restrict.vue';
import ClassForm from './views/class/ClassForm.vue';
import ListClass from './views/class/ListClass.vue';
import StudentReport from './views/report/StudentReport.vue';
import { Role } from '@/shared/consts/role';
import { guardMiddleware } from '@/middleware/guard-middleware';

const restrictRoutes = [
  {
    path: 'restrict',
    component: Restrict,
    beforeEnter: guardMiddleware([Role.Teacher, Role.Student])
  },
  {
    path: 'class-form',
    component: ClassForm,
    beforeEnter: guardMiddleware([Role.Teacher])
  },
  {
    path: 'class-form/:id',
    component: ClassForm,
    beforeEnter: guardMiddleware([Role.Teacher])
  },
  {
    path: 'list-class',
    component: ListClass,
    beforeEnter: guardMiddleware([Role.Teacher, Role.Student])
  },
  {
    path: 'student-report',
    component: StudentReport,
    beforeEnter: guardMiddleware([Role.Teacher, Role.Student])
  }

];

export default restrictRoutes;
