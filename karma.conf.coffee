module.exports = (config) -> config.set
  # base path, that will be used to resolve files and exclude
  basePath: ''

  frameworks: ['jasmine']
  
  preprocessors: {  
    'test/**/*.js': ['coverage']
  }

  # list of files / patterns to load in the browser
  files: [
    'public/vendor.js',
    'public/amaretti.js',
    'node_modules/mock-promises/lib/mock-promises.js',
    'test/*.js'
  ]

  # list of files to exclude
  exclude: []

  # use dots reporter, as travis terminal does not support escaping sequences
  # possible values: 'dots' || 'progress'
  reporters: ['dots', 'coverage']

  coverageReporter: {  
    type: 'lcov',
    dir: 'build/coverage/'
  }

  # Where to save JUnit test results
  junitReporter:
    outputFile: 'test-results-frontend.xml'

  # web server port
  port: 9876

  # cli runner port
  runnerPort: 9100

  # enable / disable colors in the output (reporters and logs)
  colors: true

  # level of logging
  # possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
  logLevel: config.LOG_INFO

  # enable / disable watching file and executing tests whenever any file changes
  autoWatch: true

  # Start these browsers, currently available:
  # - Chrome
  # - ChromeCanary
  # - Firefox
  # - Opera
  # - Safari
  # - PhantomJS
  browsers: ['Firefox']

  # Auto run tests on start (when browsers are captured) and exit
  #singleRun: true
  singleRun: false

