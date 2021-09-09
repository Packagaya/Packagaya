import { HandlebarsEngine } from '../HandlebarsEngine';

describe('Handlebars Engine', () => {
    let handlebarsEngine: HandlebarsEngine;

    beforeEach(() => {
        handlebarsEngine = new HandlebarsEngine();
    });

    it('should be defined', () => {
        expect(handlebarsEngine).toBeInstanceOf(HandlebarsEngine);
    });

    it('should render a template', () => new Promise<void>((done) => {
        expect.assertions(1);

        const context = {
            name: 'world',
        };

        const renderedTemplate = handlebarsEngine.render(
            'hello {{name}}',
            context,
        ).then((result) => {
            expect(result).toBe('hello world');

            done();
        });
    }));
});
