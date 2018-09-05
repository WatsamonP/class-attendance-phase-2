import { ScoreModule } from './score.module';

describe('ScoreModule', () => {
    let scoreModule: ScoreModule;

    beforeEach(() => {
        scoreModule = new ScoreModule();
    });

    it('should create an instance', () => {
        expect(scoreModule).toBeTruthy();
    });
});
