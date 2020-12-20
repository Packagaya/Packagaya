/**
 * Defines the output of a subprocess execution
 *
 * @export
 * @interface IExecutionResult
 */
export interface IExecutionResult {
    /**
     * Contains all lines which were logged to stdout
     *
     * @type {string[]}
     * @memberof IExecutionResult
     */
    stdOut: string[];

    /**
     * Contains all lines which were logged to stderr
     *
     * @type {string[]}
     * @memberof IExecutionResult
     */
    stdErr: string[];

    /**
     * Contains the subprocess exit code
     *
     * @type {number}
     * @memberof IExecutionResult
     */
    exitCode: number;
}
