@echo off

set DEFAULT_JVM_OPTS=-Xmx64m -Xms64m
set APP_HOME=%~dp0
set WRAPPER_JAR=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

if not exist "%WRAPPER_JAR%" (
    echo Error: Gradle wrapper jar not found at %WRAPPER_JAR%
    exit /b 1
)

java %DEFAULT_JVM_OPTS% -cp "%WRAPPER_JAR%" org.gradle.wrapper.GradleWrapperMain %*
