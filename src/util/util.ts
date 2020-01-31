import moment from 'moment';

export const getTimestamp = (date: Date) => {
    const duration = moment.duration(Date.now() - date.getTime());
    console.log(`Duration: ${duration.asHours()}`);
    const currMoment = moment(date.toString());
    if (duration.asWeeks() > 1)
        return currMoment.format('dddd, MMMM Do YYYY');
    else if (duration.asDays() > 1)
        return currMoment.format('"ddd, h a"');
    else
        return currMoment.format('h:mm a');
}