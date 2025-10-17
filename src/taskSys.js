/*
doas -su mylife.root - taskSys.js - Task System Framework

LICENSE: GPLv3, Author: BlueLighting.
*/

let tasks = {};

class Task {
    constructor(name, callback, story) {
        this.name = name;
        this.callback = callback;
        this.story = story;
    }

    launchTask() {
        this.callback();
    }

    storyFinish() {
        if (this.story >= storyWhere) {
            return true;
        }
        return false;
    }

    removeSelf() {
        delete tasks[this.name];
    }

    showTaskInfo() {
        echoContent("HumanOS - TASK INFORMATION");
        echoContent("    Task Name: " + this.name);
        echoContent("    Need pointer: " + this.story);
        echoContent("    Task Status: " + (this.storyFinish() ? "Ready" : "Not Ready"));
    }
}

function newTask(name, callback, story) {
    tasks[name] = new Task(name, callback, story);
}

function launchTask(name) {
    if (tasks[name] != null) {
        if (tasks[name].storyFinish()) {
            tasks[name].launchTask();
            tasks[name].removeSelf();
        } else {
            console.error(`TaskError: Task ${name} is not ready, But you want to trig it.`)
        }
    } else {
        console.error(`TaskError: Task ${name} does not exist.`)
    }
}

function showTaskInfo(name) {
    if (tasks[name] != null) {
        tasks[name].showTaskInfo();
    } else {
        console.error(`TaskError: Task ${name} does not exist.`)
    }
}

function allTask() {
    return tasks;
}

window.TaskSysAPI = {
    newTask,
    launchTask,
    showTaskInfo,
    Task,
    tasks
};