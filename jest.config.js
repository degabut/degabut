module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  moduleNameMapper: {
    "@api(.*)": "<rootDir>/api$1",
    "@auth(.*)": "<rootDir>/auth$1",
    "@apps(.*)": "<rootDir>/apps$1",
    "@common(.*)": "<rootDir>/common$1",
    "@database(.*)": "<rootDir>/database$1",
    "@discord-bot(.*)": "<rootDir>/discord-bot$1",
    "@events(.*)": "<rootDir>/events$1",
    "@playlist(.*)": "<rootDir>/playlist$1",
    "@queue(.*)": "<rootDir>/queue$1",
    "@user(.*)": "<rootDir>/user$1",
    "@youtube(.*)": "<rootDir>/youtube$1",
  },
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
