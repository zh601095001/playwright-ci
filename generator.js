const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const crypto = require('crypto');

function readDirectory(directory, extension) {
    let testFiles = [];
    const files = fs.readdirSync(directory, {withFileTypes: true});
    files.forEach(file => {
        const fullPath = path.posix.join(directory, file.name);
        if (file.isDirectory()) {
            testFiles = testFiles.concat(readDirectory(fullPath, extension));
        } else {
            if (fullPath.endsWith(extension)) {
                testFiles.push(fullPath);
            }
        }
    });
    return testFiles;
}

const testFiles = readDirectory('./tests', '.test.ts'); // 修改为你的测试文件目录

const ciConfig = {
    stages: ["install", 'test'],
    cache: {
        key: "${CI_COMMIT_REF_SLUG}",
        paths: ["node_modules/", "browsers/","./test-result"],
        policy: "pull-push"
    },
    variables: {
        PLAYWRIGHT_BROWSERS_PATH: "$CI_PROJECT_DIR/browsers"
    },
    "install-browser": {
        stage: "install",
        script: ["npx playwright install"],
        tags: ["windows"]
    },
};

testFiles.forEach((filePath) => {
    const uniqueToken = crypto.randomBytes(16).toString('hex')
    const reportPath = `./reports/report_${uniqueToken}.json`;  // 定义 JSON 报告文件的路径
    ciConfig[`playwright_test_${uniqueToken}`] = {
        stage: 'test',
        script: [
            `npx playwright test ${filePath} --output=${reportPath}`,
            `$uri = 'http://example.com/api/endpoint'`,
            `$body = Get-Content -Path '${reportPath}' -Raw`,
            `$response = Invoke-WebRequest -Uri $uri -Method Post -Body $body -ContentType 'application/json'`,
            `Write-Output "Response: $($response.Content)"`,
        ],
        tags: ['windows'] // 修改为你的 GitLab Runner 标签
    };
});

const yamlConfig = yaml.dump(ciConfig);
fs.writeFileSync('dynamic-config.yml', yamlConfig);
console.log('.gitlab-ci.yml has been generated with specific Playwright test jobs.');
