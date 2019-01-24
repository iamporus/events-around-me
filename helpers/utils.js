function getFormattedDate(date) {
    var month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    return date.getFullYear() + "-" + month + "-" + date.getDate();
}

function getDateWithoutYear(date){
    return date.toDateString().substring(0,date.toDateString().length - 4);
}

function getFormattedTime(date){
    return date.toTimeString().substring(0,date.toDateString().length - 10);
}

var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getShortEventDescription(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let shortenedDate = getDateWithoutYear(eventDate);
    return event.title + ", a " + category + " event; on " + shortenedDate;
}

function getHumanReadableTime(minutes){
    let hours = minutes/60;
    let mins = minutes%60;
    let days = (minutes/60) / 24;
    let time;
    if( hours == 0 ){
        time = minutes + " minutes";
    }
    else if(hours == 1){
        time = "1 hour "+ mins + " minutes";
    }
    else if( hours > 24){
        if(hours < 48 ){
            time = "the whole day";
        }
        else{
            time = days + " days";
        }
    }
    else{
        time = hours + " hours "+ mins + " minutes";
    }
    return time;
}

function getEventDescription(event){
    let eventDate = new Date(event.start);
    let category = event.category;
    let description = event.description;
    let time = getFormattedTime(eventDate);
    let duration = getHumanReadableTime(event.duration);
    let shortenedDate = getDateWithoutYear(eventDate);

    if(description.length > 0){
        return "<speak>The event " + event.title + " is a " + category + " event and is scheduled on " + shortenedDate + ". "
        + "<break time=\"1s\"/> It will start at " + time + " and will run for " + duration + ". " + "Here's its description. " + description;
    }
    else{
        return "The event " + event.title + " is a " + category + " event and is scheduled on " + shortenedDate + ". "
        + "<break time=\"1s\"/> It will start at " + time + " and will run for " + duration + ". " + " I couldn't find more details on this.";
    }
}


module.exports.getFormattedDate = getFormattedDate;
module.exports.getDateWithoutYear = getDateWithoutYear;
module.exports.getFormattedTime = getFormattedTime;
module.exports.getShortEventDescription = getShortEventDescription;
module.exports.getEventDescription = getEventDescription;
module.exports.getHumanReadableTime = getHumanReadableTime;