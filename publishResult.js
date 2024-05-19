const fs = require("fs")
const {test} = require("@playwright/test");
const {basename} = require("node:path");

let data = fs.readFileSync("test-results/results.json")

data = JSON.parse(data)

let suites = data["suites"]

suites = suites.map(suite => {
    const suite_title = suite.title
    const suite_file = suite.file
    let inner_suites = suite.suites.map(inner_suite => {
        const inner_suite_title = inner_suite.title
        const inner_suite_file = inner_suite.file
        const suite_specs = inner_suite.specs.map(suite_spec => {
            const suite_spec_title = suite_spec.title
            const suite_spec_ok = suite_spec.ok
            const suite_spec_id = suite_spec.id
            const tests = suite_spec.tests
                .filter(test => {
                    return test.status === "unexpected"
                })
                .map(failedTest => {
                    return failedTest.results.map(failedTestsResult => {
                        const workerIndex = failedTestsResult.workerIndex
                        const stack = failedTestsResult.error.stack
                        const location = failedTestsResult.error.location
                        const startTime = failedTestsResult.startTime
                        const attachments = failedTestsResult.attachments.map(attachment => {
                            const attachment_path = attachment.path
                            const attachment_name = basename(attachment_path).replace(".","-");
                            return {
                                uid: `${suite_spec_id}-${workerIndex}-${attachment_name}`,
                                ...attachment
                            }
                        })
                        return {
                            stack,
                            startTime,
                            location,
                            attachments
                        }
                    })
                })
            return {
                suite_spec_title,
                suite_spec_ok,
                tests
            }
        })
        return {
            suite_specs,
            inner_suite_title,
            inner_suite_file
        }
    })

    return {
        suite_title,
        inner_suites,
        suite_file,
    }
})
fs.writeFileSync("./result.json", JSON.stringify(suites))