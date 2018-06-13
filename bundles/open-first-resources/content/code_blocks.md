---
type: document
title: Additional Features for Code Blocks
description: An overview and examples for how to highlight, and line numbers to, and add notes to code blocks in OFR content.
---
Normally in Markdown, you specify code blocks like this:
~~~
```
/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}
```
~~~

which results in

```
/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}
```

With GitHub and OFR, you can also specify a language to do syntax highlighting:
~~~
```javascript

...code...

```
~~~

which results in
```javascript
/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}
```

OFR extends that syntax of things after the ```` ``` ````s (unfortunately it cannot contain spaces):

```` ```# ````
```#
/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}
```

```` ```javascript#42 ````
```javascript#42
/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}
```

```` ```@4@6,hi@1@9 ````
```@4@6,hi@1@9
/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}
```

```` ```javascript#42@4@6,hi@1@9 ````
```javascript#42@4@6,hi@1@9
/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}
```