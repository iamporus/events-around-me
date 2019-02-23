var moment = require('moment-timezone');

function getFormattedDate(date) {
    var month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    return date.getFullYear() + "-" + month + "-" + date.getDate();
}

function getDateWithoutYear(date){
    var day = moment(date);
    return day.format('dddd, Do') + " "+ day.format('MMMM');
}

function getFormattedTime(date, timezone){
    return moment(new Date(date)).tz(timezone).format('h:mm a');
}

function getReminderDate(date, timezone){
    return moment(new Date(date)).tz(timezone).add(4, 'hour').add(30, 'minutes').toISOString();
}

function getReminderTime(date, timezone){
    return moment(new Date(date)).tz(timezone).subtract(1, 'hour').format('h:mm a');
}

function getEventTime(date, timezone){
    return moment(new Date(date)).tz(timezone).format('h:mm a');
}

function getReminderDateForText(date, timezone){
    return moment(new Date(date)).tz(timezone).subtract(1, 'hour').format('Do MMMM');
}

function getShortEventDescription(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let shortenedDate = getDateWithoutYear(eventDate);
    return event.title + ", a " + category + " event; on " + shortenedDate + ". ";
}

function getEventDescriptionForCard(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let shortenedDate = getDateWithoutYear(eventDate);
    let timezone = event.timezone;
    let time = getFormattedTime(eventDate, timezone);
    return "Category: " + category + "\n\nScheduled on: " + shortenedDate + "\n\nStarting at: " + time ;
}

function getShortEventDescriptionWithoutDate(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let timezone = event.timezone;
    let time = getFormattedTime(eventDate, timezone);
    return event.title + ", a " + category + " event, starting at " + time + ". ";
}

function getHumanReadableTime(seconds){
    var duration = moment.duration(seconds * 1000);
    return duration.humanize();
}

function getEventDescription(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let description = event.description;
    let timezone = event.timezone;
    let time = getFormattedTime(eventDate, timezone);

    let duration;
    if(event.duration !== 0){
        duration = getHumanReadableTime(event.duration);
    }else{
        duration = 'unknown duration';
    }
    let shortenedDate = getDateWithoutYear(eventDate);

    return "The event " + event.title + " is a " + category + " event and is scheduled on " + shortenedDate + ". "
    + "It will start at " + time + " and will run for " + duration + ". ";

}


module.exports.getFormattedDate = getFormattedDate;
module.exports.getDateWithoutYear = getDateWithoutYear;
module.exports.getFormattedTime = getFormattedTime;
module.exports.getReminderDate = getReminderDate;
module.exports.getReminderTime = getReminderTime;
module.exports.getEventTime = getEventTime;
module.exports.getReminderDateForText = getReminderDateForText;
module.exports.getShortEventDescription = getShortEventDescription;
module.exports.getEventDescription = getEventDescription;
module.exports.getHumanReadableTime = getHumanReadableTime;
module.exports.getShortEventDescriptionWithoutDate = getShortEventDescriptionWithoutDate;
module.exports.getEventDescriptionForCard = getEventDescriptionForCard;