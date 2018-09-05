import { DeleteCourseModule } from './delete-course.module';

describe('DeleteCourseModule', () => {
    let deleteCourseModule: DeleteCourseModule;

    beforeEach(() => {
        deleteCourseModule = new DeleteCourseModule();
    });

    it('should create an instance', () => {
        expect(deleteCourseModule).toBeTruthy();
    });
});
