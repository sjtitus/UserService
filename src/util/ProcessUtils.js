/*_________________________________________________________________________________________________
 * Process level backend utilities
 *_________________________________________________________________________________________________
*/

//_____________________________________________________________________________
// WaitThenExit
// Wait for a specified number of seconds (letting event loop run)
// and then exit.
export async function WaitThenExit(waitSeconds) {
    await new Promise(resolve => setTimeout(resolve, waitSeconds*1000));
    process.exit(0);
}

// Top level error handlers
export function InstallTopLevelHandlers(unHandledRejectionHandler, uncaughtExceptionHandler, exitHandler) {
    process.on('unhandledRejection', unHandledRejectionHandler); 
    process.on('uncaughtException', uncaughtExceptionHandler); 
    process.on('exit', exitHandler); 
}

