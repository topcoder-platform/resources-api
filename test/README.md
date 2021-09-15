## JMeter GUI

Default env file are provided to allow testing the project without executing CI.

```bash
source env/api.env
source env/credentials.env
source env/m2m.env
jmeter -t <path to jmx file>
```

## Testing with maven

```bash
mvn clean verify

...

INFO] -------------------------------------------------------
[INFO] C O N F I G U R I N G    J M E T E R
[INFO] -------------------------------------------------------
[INFO]
[INFO] Building JMeter directory structure...
[INFO] Configuring JMeter artifacts...
[INFO] Populating JMeter directory...
[INFO] Copying extensions to JMeter lib/ext directory /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/lib/ext with downloadExtensionDependencies set to true...
[WARNING] The POM for commons-math3:commons-math3:jar:3.4.1 is missing, no dependency information available
[WARNING] The POM for commons-pool2:commons-pool2:jar:2.3 is missing, no dependency information available
[INFO] Copying JUnit libraries to JMeter junit lib directory /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/lib/junit with downloadLibraryDependencies set to true...
[INFO] Copying test libraries to JMeter lib directory /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/lib with downloadLibraryDependencies set to true...
[WARNING] The POM for xom:xom:jar:1.2.10 is missing, no dependency information available
[INFO] Configuring JMeter properties...
[INFO] Generating JSON Test config...
[INFO]
[INFO] <<< jmeter-maven-plugin:2.9.0:jmeter (jmeter-tests) < :configure @ jmeter-maven-plugin-demo <<<
[INFO]
[INFO]
[INFO] --- jmeter-maven-plugin:2.9.0:jmeter (jmeter-tests) @ jmeter-maven-plugin-demo ---
[INFO]
[INFO] -------------------------------------------------------
[INFO]  P E R F O R M A N C E    T E S T S
[INFO] -------------------------------------------------------
[INFO]
[INFO] Will generate HTML report in /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/reports/Resource API
[INFO] Executing test: Resource API.jmx
[INFO] Arguments for forked JMeter JVM: [java, -Xms512M, -Xmx512M, -XX:MaxMetaspaceSize=512m, -Xmx2048m, -Xms2048m, -Djava.awt.headless=true, -jar, ApacheJMeter-5.1.1.jar, -d, /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter, -e, -j, /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/logs/Resource API.jmx.log, -l, /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/results/20210803-Resource API.csv, -n, -o, /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/reports/Resource API, -t, /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/testFiles/Resource API.jmx, -Dsun.net.http.allowRestrictedHeaders, true]
[INFO]
[INFO] WARNING: An illegal reflective access operation has occurred
[INFO] WARNING: Illegal reflective access by com.thoughtworks.xstream.core.util.Fields (file:/Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/lib/xstream-1.4.11.jar) to field java.util.TreeMap.comparator
[INFO] WARNING: Please consider reporting this to the maintainers of com.thoughtworks.xstream.core.util.Fields
[INFO] WARNING: Use --illegal-access=warn to enable warnings of further illegal reflective access operations
[INFO] WARNING: All illegal access operations will be denied in a future release
[INFO] Warning: Nashorn engine is planned to be removed from a future JDK release
[INFO] Creating summariser <summary>
[INFO] Created the tree successfully using /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/testFiles/Resource API.jmx
[INFO] Starting the test @ Tue Aug 03 16:12:31 CEST 2021 (1627999951676)
[INFO] Waiting for possible Shutdown/StopTestNow/HeapDump/ThreadDump message on port 4445
[INFO] Warning: Nashorn engine is planned to be removed from a future JDK release
[INFO] summary +      1 in 00:00:03 =    0,3/s Avg:  2915 Min:  2915 Max:  2915 Err:     0 (0,00%) Active: 1 Started: 1 Finished: 0
[INFO] summary +     22 in 00:00:18 =    1,3/s Avg:   518 Min:     1 Max:  1880 Err:     8 (36,36%) Active: 0 Started: 1 Finished: 1
[INFO] summary =     23 in 00:00:21 =    1,1/s Avg:   623 Min:     1 Max:  2915 Err:     8 (34,78%)
[INFO] Tidying up ...    @ Tue Aug 03 16:12:53 CEST 2021 (1627999973022)
[INFO] ... end of run
[INFO] Completed Test: /Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/testFiles/Resource API.jmx
[INFO]
[INFO]
[INFO] --- jmeter-maven-plugin:2.9.0:results (jmeter-tests) @ jmeter-maven-plugin-demo ---
[INFO]
[INFO] -------------------------------------------------------
[INFO] S C A N N I N G    F O R    R E S U L T S
[INFO] -------------------------------------------------------
[INFO]
[INFO] Will scan results using format: CSV
[INFO]
[INFO] Parsing results file '/Users/gmagniez/Work/topcoder/jmeter/submission/target/jmeter/results/20210803-Resource API.csv' as type: CSV
[INFO] Number of failures in '20210803-Resource API.csv': 8
[INFO] Number of successes in '20210803-Resource API.csv': 15
[INFO]
[INFO] -------------------------------------------------------
[INFO] P E R F O R M A N C E    T E S T    R E S U L T S
[INFO] -------------------------------------------------------
[INFO]
[INFO] Result (.csv) files scanned: 1
[INFO] Successful requests:         15
[INFO] Failed requests:             8
[INFO] Failures:                    34.782608% (60.0% accepted)
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 33.142 s
[INFO] Finished at: 2021-08-03T16:12:54+02:00
[INFO] ------------------------------------------------------------------------
[INFO] Shutdown detected, destroying JMeter process...
[INFO]
```

## Testing

## Integration with CircleCI

#### Importing this ORB :

To import and use this orb , import it in your circleci configuration like below under the root node. :

```yaml
orbs:
  performance-orb: topcoder-platform/performance-orb@1.0.0
```

Then use it like :

```yaml
workflows:
  version: 2
  Performance Testing:
   when: << pipeline.parameters.run_performancetesting >>
   jobs:
      - performance-orb/Performance-Testing:
```



[Reference](https://circleci.com/docs/2.0/orb-intro/#benefits-of-using-orbs)
