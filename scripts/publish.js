#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const semver = require("semver");
const git = require("git-rev-sync");
/**
 * Use cases
 *
 *  If no version is published, pick the version from the package.json and publish that version
 *
 *  If a version is published and the minor and major matches the package.json, publish a patch
 *
 *  If the packaje.json version minor and major differs from the published version, pick the latest published patch for the version of the package.json and increment the patch number
 *
 */
async function execute(command) {
    return new Promise((onSuccess, onError) => {
        child_process_1.exec(command, (error, stdout, stderr) => {
            stdout.length && console.log(stdout);
            stderr.length && console.error(stderr);
            if (error) {
                onError(stderr);
            }
            else {
                onSuccess(stdout);
            }
        });
    });
}
async function getBranch() {
    return git.branch();
}
async function setVersion(newVersion) {
    return await execute(`npm version ${newVersion} --force --no-git-tag-version --allow-same-version`);
}
async function publish(npmTag = null) {
    if (!npmTag) {
        return await execute(`npm publish`);
    }
    else {
        return await execute(`npm publish --tag=${npmTag}`);
    }
}
async function getVersion() {
    const pkgJsonVersion = await execute("npm view . version");
    const version = semver.parse(pkgJsonVersion.trim());
    if (!version) {
        throw new Error("Unable to parse semver from " + pkgJsonVersion);
    }
    const commit = git.short();
    if (!commit) {
        throw new Error("Unable to get git commit");
    }
    return `${version.major}.${version.minor}.${version.patch}-${git.short()}`;
}
console.log(`Current directory: ${process.cwd()}`);
const run = async () => {
    let branch = process.env.BRANCH_NAME || process.env.TRAVIS_BRANCH || (await getBranch());
    let npmTag = null;
    let gitTag = process.env.TRAVIS_TAG || null;
    let latestVersion;
    let newVersion = null;
    console.log(`Using branch ${branch}`);
    // Travis keeps the branch name in the tags' builds
    if (gitTag) {
        if (semver.valid(gitTag)) {
            // If the tags is a valid semver, we publish using that version and without any npmTag
            npmTag = null;
            newVersion = gitTag;
        }
    }
    else if (branch === "master") {
        npmTag = "latest";
    }
    else if (branch === "develop") {
        npmTag = "next";
    }
    else if (branch.startsWith("dev-")) {
        npmTag = branch;
    }
    if (!newVersion) {
        newVersion = await getVersion();
    }
    await setVersion(newVersion);
    console.log(`Publishing branch ${branch} with version=${newVersion} and tag=${npmTag ||
        "<empty tag>"}`);
    await publish(npmTag);
};
run().catch(e => {
    console.error("Error:");
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaURBQXFDO0FBQ3JDLGlDQUFrQztBQUNsQyxvQ0FBcUM7QUFFckM7Ozs7Ozs7OztHQVNHO0FBRUgsS0FBSyxrQkFBa0IsT0FBTztJQUM1QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDaEQsb0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3RDLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxLQUFLO0lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QixDQUFDO0FBRUQsS0FBSyxxQkFBcUIsVUFBa0I7SUFDMUMsTUFBTSxDQUFDLE1BQU0sT0FBTyxDQUNsQixlQUFlLFVBQVUsb0RBQW9ELENBQzlFLENBQUM7QUFDSixDQUFDO0FBRUQsS0FBSyxrQkFBa0IsU0FBaUIsSUFBSTtJQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDWixNQUFNLENBQUMsTUFBTSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFD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QUVGLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0IHsgZXhlYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZShcInNlbXZlclwiKTtcbmltcG9ydCBnaXQgPSByZXF1aXJlKFwiZ2l0LXJldi1zeW5jXCIpO1xuXG4vKipcbiAqIFVzZSBjYXNlc1xuICpcbiAqICBJZiBubyB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCwgcGljayB0aGUgdmVyc2lvbiBmcm9tIHRoZSBwYWNrYWdlLmpzb24gYW5kIHB1Ymxpc2ggdGhhdCB2ZXJzaW9uXG4gKlxuICogIElmIGEgdmVyc2lvbiBpcyBwdWJsaXNoZWQgYW5kIHRoZSBtaW5vciBhbmQgbWFqb3IgbWF0Y2hlcyB0aGUgcGFja2FnZS5qc29uLCBwdWJsaXNoIGEgcGF0Y2hcbiAqXG4gKiAgSWYgdGhlIHBhY2thamUuanNvbiB2ZXJzaW9uIG1pbm9yIGFuZCBtYWpvciBkaWZmZXJzIGZyb20gdGhlIHB1Ymxpc2hlZCB2ZXJzaW9uLCBwaWNrIHRoZSBsYXRlc3QgcHVibGlzaGVkIHBhdGNoIGZvciB0aGUgdmVyc2lvbiBvZiB0aGUgcGFja2FnZS5qc29uIGFuZCBpbmNyZW1lbnQgdGhlIHBhdGNoIG51bWJlclxuICpcbiAqL1xuXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlKGNvbW1hbmQpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigob25TdWNjZXNzLCBvbkVycm9yKSA9PiB7XG4gICAgZXhlYyhjb21tYW5kLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICBzdGRvdXQubGVuZ3RoICYmIGNvbnNvbGUubG9nKHN0ZG91dCk7XG4gICAgICBzdGRlcnIubGVuZ3RoICYmIGNvbnNvbGUuZXJyb3Ioc3RkZXJyKTtcblxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIG9uRXJyb3Ioc3RkZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uU3VjY2VzcyhzdGRvdXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0QnJhbmNoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBnaXQuYnJhbmNoKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldFZlcnNpb24obmV3VmVyc2lvbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoXG4gICAgYG5wbSB2ZXJzaW9uICR7bmV3VmVyc2lvbn0gLS1mb3JjZSAtLW5vLWdpdC10YWctdmVyc2lvbiAtLWFsbG93LXNhbWUtdmVyc2lvbmBcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHVibGlzaChucG1UYWc6IHN0cmluZyA9IG51bGwpOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAoIW5wbVRhZykge1xuICAgIHJldHVybiBhd2FpdCBleGVjdXRlKGBucG0gcHVibGlzaGApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhd2FpdCBleGVjdXRlKGBucG0gcHVibGlzaCAtLXRhZz0ke25wbVRhZ31gKTtcbiAgfVxufVxuXG5pbXBvcnQgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRWZXJzaW9uKCkge1xuICBjb25zdCBwa2dKc29uVmVyc2lvbiA9IGF3YWl0IGV4ZWN1dGUoXCJucG0gdmlldyAuIHZlcnNpb25cIik7XG5cbiAgY29uc3QgdmVyc2lvbiA9IHNlbXZlci5wYXJzZShwa2dKc29uVmVyc2lvbi50cmltKCkpO1xuXG4gIGlmICghdmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBzZW12ZXIgZnJvbSBcIiArIHBrZ0pzb25WZXJzaW9uKTtcbiAgfVxuXG4gIGNvbnN0IGNvbW1pdCA9IGdpdC5zaG9ydCgpO1xuXG4gIGlmICghY29tbWl0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGdldCBnaXQgY29tbWl0XCIpO1xuICB9XG5cbiAgcmV0dXJuIGAke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vcn0uJHt2ZXJzaW9uLnBhdGNofS0ke2dpdC5zaG9ydCgpfWA7XG59XG5cbmNvbnNvbGUubG9nKGBDdXJyZW50IGRpcmVjdG9yeTogJHtwcm9jZXNzLmN3ZCgpfWApO1xuXG5jb25zdCBydW4gPSBhc3luYyAoKSA9PiB7XG4gIGxldCBicmFuY2ggPVxuICAgIHByb2Nlc3MuZW52LkJSQU5DSF9OQU1FIHx8IHByb2Nlc3MuZW52LlRSQVZJU19CUkFOQ0ggfHwgKGF3YWl0IGdldEJyYW5jaCgpKTtcblxuICBsZXQgbnBtVGFnOiBzdHJpbmcgPSBudWxsO1xuXG4gIGxldCBnaXRUYWc6IHN0cmluZyA9IHByb2Nlc3MuZW52LlRSQVZJU19UQUcgfHwgbnVsbDtcblxuICBsZXQgbGF0ZXN0VmVyc2lvbjtcblxuICBsZXQgbmV3VmVyc2lvbjogc3RyaW5nID0gbnVsbDtcblxuICBjb25zb2xlLmxvZyhgVXNpbmcgYnJhbmNoICR7YnJhbmNofWApO1xuXG4gIC8vIFRyYXZpcyBrZWVwcyB0aGUgYnJhbmNoIG5hbWUgaW4gdGhlIHRhZ3MnIGJ1aWxkc1xuICBpZiAoZ2l0VGFnKSB7XG4gICAgaWYgKHNlbXZlci52YWxpZChnaXRUYWcpKSB7XG4gICAgICAvLyBJZiB0aGUgdGFncyBpcyBhIHZhbGlkIHNlbXZlciwgd2UgcHVibGlzaCB1c2luZyB0aGF0IHZlcnNpb24gYW5kIHdpdGhvdXQgYW55IG5wbVRhZ1xuICAgICAgbnBtVGFnID0gbnVsbDtcbiAgICAgIG5ld1ZlcnNpb24gPSBnaXRUYWc7XG4gICAgfVxuICB9IGVsc2UgaWYgKGJyYW5jaCA9PT0gXCJtYXN0ZXJcIikge1xuICAgIG5wbVRhZyA9IFwibGF0ZXN0XCI7XG4gIH0gZWxzZSBpZiAoYnJhbmNoID09PSBcImRldmVsb3BcIikge1xuICAgIG5wbVRhZyA9IFwibmV4dFwiO1xuICB9IGVsc2UgaWYgKGJyYW5jaC5zdGFydHNXaXRoKFwiZGV2LVwiKSkge1xuICAgIG5wbVRhZyA9IGJyYW5jaDtcbiAgfVxuXG4gIGlmICghbmV3VmVyc2lvbikge1xuICAgIG5ld1ZlcnNpb24gPSBhd2FpdCBnZXRWZXJzaW9uKCk7XG4gIH1cblxuICBhd2FpdCBzZXRWZXJzaW9uKG5ld1ZlcnNpb24pO1xuXG4gIGNvbnNvbGUubG9nKFxuICAgIGBQdWJsaXNoaW5nIGJyYW5jaCAke2JyYW5jaH0gd2l0aCB2ZXJzaW9uPSR7bmV3VmVyc2lvbn0gYW5kIHRhZz0ke25wbVRhZyB8fFxuICAgICAgXCI8ZW1wdHkgdGFnPlwifWBcbiAgKTtcblxuICBhd2FpdCBwdWJsaXNoKG5wbVRhZyk7XG59O1xuXG5ydW4oKS5jYXRjaChlID0+IHtcbiAgY29uc29sZS5lcnJvcihcIkVycm9yOlwiKTtcbiAgY29uc29sZS5lcnJvcihlKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufSk7XG4iXX0=