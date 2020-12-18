import { HandlebarsEngine } from '../HandlebarsEngine';

describe('Handlebars Engine', () => {
    let handlebarsEngine: HandlebarsEngine;

    beforeEach(() => {
        handlebarsEngine = new HandlebarsEngine();
    });

    it('should be defined', () => {
        expect(handlebarsEngine).toBeInstanceOf(HandlebarsEngine);
    });

    it('should render a template', async (done) => {
        expect.assertions(1);

        const context = {
            name: 'world',
        };

        const renderedTemplate = await handlebarsEngine.render(
            'hello {{name}}',
            context,
        );

        expect(renderedTemplate).toBe('hello world');

        done();
    });
});
