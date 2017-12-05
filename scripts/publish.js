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
const fs = require("fs");
async function getVersion() {
    const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const pkgJsonVersion = json.version;
    const version = semver.parse(pkgJsonVersion.trim());
    if (!version) {
        throw new Error("Unable to parse semver from " + pkgJsonVersion);
    }
    return `${version.major}.${version.minor}.${version.patch}`;
}
async function getSnapshotVersion() {
    const commit = git.short();
    if (!commit) {
        throw new Error("Unable to get git commit");
    }
    const time = new Date().toISOString().replace(/(\..*$)/g, '').replace(/([^\dT])/g, '').replace('T', '.');
    return (await getVersion()) + '-' + time + '.' + commit;
}
console.log(`Current directory: ${process.cwd()}`);
const run = async () => {
    let branch = process.env.BRANCH_NAME || process.env.TRAVIS_BRANCH || (await getBranch());
    let npmTag = null;
    let gitTag = process.env.TRAVIS_TAG || null;
    let newVersion = null;
    console.log(`Using branch ${branch}`);
    // Travis keeps the branch name in the tags' builds
    if (gitTag) {
        if (semver.valid(gitTag)) {
            // If the tags is a valid semver, we publish using that version and without any npmTag
            npmTag = null;
            newVersion = gitTag;
        }
        else {
            npmTag = 'tag-' + gitTag;
            newVersion = await getSnapshotVersion();
        }
    }
    else if (branch === "master") {
        npmTag = "latest";
        newVersion = await getSnapshotVersion();
    }
    else if (branch === "develop") {
        npmTag = "next";
        newVersion = await getSnapshotVersion();
    }
    else if (branch.startsWith("dev-")) {
        npmTag = branch;
        newVersion = await getSnapshotVersion();
    }
    else {
        newVersion = await getSnapshotVersion();
    }
    console.log(`Publishing branch ${branch} with version=${newVersion} and tag=${npmTag || "<empty tag>"}`);
    await setVersion(newVersion);
    await publish(npmTag);
};
run().catch(e => {
    console.error("Error:");
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaURBQXFDO0FBQ3JDLGlDQUFrQztBQUNsQyxvQ0FBcUM7QUFFckM7Ozs7Ozs7OztHQVNHO0FBRUgsS0FBSyxrQkFBa0IsT0FBTztJQUM1QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDaEQsb0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3RDLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxLQUFLO0lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QixDQUFDO0FBRUQsS0FBSyxxQkFBcUIsVUFBa0I7SUFDMUMsTUFBTSxDQUFDLE1BQU0sT0FBTyxDQUNsQixlQUFlLFVBQVUsb0RBQW9ELENBQzlFLENBQUM7QUFDSixDQUFDO0FBRUQsS0FBSyxrQkFBa0IsU0FBaUIsSUFBSTtJQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDWixNQUFNLENBQUMsTUFBTSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFD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Q0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDaEIsVUFBVSxHQUFHLE1BQU0sa0JBQWtCLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDaEIsVUFBVSxHQUFHLE1BQU0sa0JBQWtCLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixVQUFVLEdBQUcsTUFBTSxrQkFBa0IsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixNQUFNLGlCQUFpQixVQUFVLFlBQVksTUFBTSxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFFekcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFN0IsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBRUYsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKFwic2VtdmVyXCIpO1xuaW1wb3J0IGdpdCA9IHJlcXVpcmUoXCJnaXQtcmV2LXN5bmNcIik7XG5cbi8qKlxuICogVXNlIGNhc2VzXG4gKlxuICogIElmIG5vIHZlcnNpb24gaXMgcHVibGlzaGVkLCBwaWNrIHRoZSB2ZXJzaW9uIGZyb20gdGhlIHBhY2thZ2UuanNvbiBhbmQgcHVibGlzaCB0aGF0IHZlcnNpb25cbiAqXG4gKiAgSWYgYSB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCBhbmQgdGhlIG1pbm9yIGFuZCBtYWpvciBtYXRjaGVzIHRoZSBwYWNrYWdlLmpzb24sIHB1Ymxpc2ggYSBwYXRjaFxuICpcbiAqICBJZiB0aGUgcGFja2FqZS5qc29uIHZlcnNpb24gbWlub3IgYW5kIG1ham9yIGRpZmZlcnMgZnJvbSB0aGUgcHVibGlzaGVkIHZlcnNpb24sIHBpY2sgdGhlIGxhdGVzdCBwdWJsaXNoZWQgcGF0Y2ggZm9yIHRoZSB2ZXJzaW9uIG9mIHRoZSBwYWNrYWdlLmpzb24gYW5kIGluY3JlbWVudCB0aGUgcGF0Y2ggbnVtYmVyXG4gKlxuICovXG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGUoY29tbWFuZCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChvblN1Y2Nlc3MsIG9uRXJyb3IpID0+IHtcbiAgICBleGVjKGNvbW1hbmQsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgIHN0ZG91dC5sZW5ndGggJiYgY29uc29sZS5sb2coc3Rkb3V0KTtcbiAgICAgIHN0ZGVyci5sZW5ndGggJiYgY29uc29sZS5lcnJvcihzdGRlcnIpO1xuXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgb25FcnJvcihzdGRlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25TdWNjZXNzKHN0ZG91dCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRCcmFuY2goKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGdpdC5icmFuY2goKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0VmVyc2lvbihuZXdWZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gYXdhaXQgZXhlY3V0ZShcbiAgICBgbnBtIHZlcnNpb24gJHtuZXdWZXJzaW9ufSAtLWZvcmNlIC0tbm8tZ2l0LXRhZy12ZXJzaW9uIC0tYWxsb3ctc2FtZS12ZXJzaW9uYFxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoKG5wbVRhZzogc3RyaW5nID0gbnVsbCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghbnBtVGFnKSB7XG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoYG5wbSBwdWJsaXNoYCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoYG5wbSBwdWJsaXNoIC0tdGFnPSR7bnBtVGFnfWApO1xuICB9XG59XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0VmVyc2lvbigpIHtcbiAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKCdwYWNrYWdlLmpzb24nLCAndXRmOCcpKVxuXG4gIGNvbnN0IHBrZ0pzb25WZXJzaW9uID0ganNvbi52ZXJzaW9uO1xuXG4gIGNvbnN0IHZlcnNpb24gPSBzZW12ZXIucGFyc2UocGtnSnNvblZlcnNpb24udHJpbSgpKTtcblxuICBpZiAoIXZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcGFyc2Ugc2VtdmVyIGZyb20gXCIgKyBwa2dKc29uVmVyc2lvbik7XG4gIH1cblxuICByZXR1cm4gYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U25hcHNob3RWZXJzaW9uKCkge1xuICBjb25zdCBjb21taXQgPSBnaXQuc2hvcnQoKTtcbiAgaWYgKCFjb21taXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZ2V0IGdpdCBjb21taXRcIik7XG4gIH1cbiAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC8oXFwuLiokKS9nLCAnJykucmVwbGFjZSgvKFteXFxkVF0pL2csICcnKS5yZXBsYWNlKCdUJywgJy4nKTtcblxuICByZXR1cm4gKGF3YWl0IGdldFZlcnNpb24oKSkgKyAnLScgKyB0aW1lICsgJy4nICsgY29tbWl0O1xufVxuXG5jb25zb2xlLmxvZyhgQ3VycmVudCBkaXJlY3Rvcnk6ICR7cHJvY2Vzcy5jd2QoKX1gKTtcblxuY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICBsZXQgYnJhbmNoID1cbiAgICBwcm9jZXNzLmVudi5CUkFOQ0hfTkFNRSB8fCBwcm9jZXNzLmVudi5UUkFWSVNfQlJBTkNIIHx8IChhd2FpdCBnZXRCcmFuY2goKSk7XG5cbiAgbGV0IG5wbVRhZzogc3RyaW5nID0gbnVsbDtcblxuICBsZXQgZ2l0VGFnOiBzdHJpbmcgPSBwcm9jZXNzLmVudi5UUkFWSVNfVEFHIHx8IG51bGw7XG5cbiAgbGV0IG5ld1ZlcnNpb246IHN0cmluZyA9IG51bGw7XG5cbiAgY29uc29sZS5sb2coYFVzaW5nIGJyYW5jaCAke2JyYW5jaH1gKTtcblxuICAvLyBUcmF2aXMga2VlcHMgdGhlIGJyYW5jaCBuYW1lIGluIHRoZSB0YWdzJyBidWlsZHNcbiAgaWYgKGdpdFRhZykge1xuICAgIGlmIChzZW12ZXIudmFsaWQoZ2l0VGFnKSkge1xuICAgICAgLy8gSWYgdGhlIHRhZ3MgaXMgYSB2YWxpZCBzZW12ZXIsIHdlIHB1Ymxpc2ggdXNpbmcgdGhhdCB2ZXJzaW9uIGFuZCB3aXRob3V0IGFueSBucG1UYWdcbiAgICAgIG5wbVRhZyA9IG51bGw7XG4gICAgICBuZXdWZXJzaW9uID0gZ2l0VGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBucG1UYWcgPSAndGFnLScgKyBnaXRUYWc7XG4gICAgICBuZXdWZXJzaW9uID0gYXdhaXQgZ2V0U25hcHNob3RWZXJzaW9uKCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGJyYW5jaCA9PT0gXCJtYXN0ZXJcIikge1xuICAgIG5wbVRhZyA9IFwibGF0ZXN0XCI7XG4gICAgbmV3VmVyc2lvbiA9IGF3YWl0IGdldFNuYXBzaG90VmVyc2lvbigpO1xuICB9IGVsc2UgaWYgKGJyYW5jaCA9PT0gXCJkZXZlbG9wXCIpIHtcbiAgICBucG1UYWcgPSBcIm5leHRcIjtcbiAgICBuZXdWZXJzaW9uID0gYXdhaXQgZ2V0U25hcHNob3RWZXJzaW9uKCk7XG4gIH0gZWxzZSBpZiAoYnJhbmNoLnN0YXJ0c1dpdGgoXCJkZXYtXCIpKSB7XG4gICAgbnBtVGFnID0gYnJhbmNoO1xuICAgIG5ld1ZlcnNpb24gPSBhd2FpdCBnZXRTbmFwc2hvdFZlcnNpb24oKTtcbiAgfSBlbHNlIHtcbiAgICBuZXdWZXJzaW9uID0gYXdhaXQgZ2V0U25hcHNob3RWZXJzaW9uKCk7XG4gIH1cblxuICBjb25zb2xlLmxvZyhgUHVibGlzaGluZyBicmFuY2ggJHticmFuY2h9IHdpdGggdmVyc2lvbj0ke25ld1ZlcnNpb259IGFuZCB0YWc9JHtucG1UYWcgfHwgXCI8ZW1wdHkgdGFnPlwifWApO1xuXG4gIGF3YWl0IHNldFZlcnNpb24obmV3VmVyc2lvbik7XG5cbiAgYXdhaXQgcHVibGlzaChucG1UYWcpO1xufTtcblxucnVuKCkuY2F0Y2goZSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoXCJFcnJvcjpcIik7XG4gIGNvbnNvbGUuZXJyb3IoZSk7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn0pO1xuIl19