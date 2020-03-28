import moment from 'moment';

export const getTimestamp = (date: Date) => {
  const duration = moment.duration(Date.now() - date.getTime());
  const currMoment = moment(date.toString());
  if (duration.asWeeks() > 1)
    return currMoment.format('dddd, MMMM Do YYYY');
  else if (duration.asDays() > 1)
    return currMoment.format('ddd, h a');
  else
    return currMoment.format('h:mm a');
}

export const calculateAge = (dob: Date) => {
  return moment().diff(dob, 'years');
}

export const blobToFile = (blob: Blob, fileName: string): File => {
 const b: any = blob;
 b.lastModifiedDate = new Date();
 return new File([blob], fileName);
}

export const heights = [
  {text: "4'0", value: 48},
  {text: "4'1", value: 49},
  {text: "4'2", value: 50},
  {text: "4'3", value: 51},
  {text: "4'4", value: 52},
  {text: "4'5", value: 53},
  {text: "4'6", value: 54},
  {text: "4'7", value: 55},
  {text: "4'8", value: 56},
  {text: "4'9", value: 57},
  {text: "4'10", value: 58},
  {text: "4'11", value: 59},
  {text: "5'0", value: 60},
  {text: "5'0", value: 61},
  {text: "5'1", value: 62},
  {text: "5'2", value: 63},
  {text: "5'3", value: 64},
  {text: "5'4", value: 65},
  {text: "5'5", value: 66},
  {text: "5'6", value: 67},
  {text: "5'7", value: 68},
  {text: "5'8", value: 69},
  {text: "5'9", value: 70},
  {text: "5'10", value: 71},
  {text: "5'11", value: 72},
  {text: "6'0", value: 73},
  {text: "6'1", value: 74},
  {text: "6'2", value: 75},
  {text: "6'3", value: 76},
  {text: "6'4", value: 77},
  {text: "6'5", value: 78},
  {text: "6'6", value: 79},
  {text: "6'7", value: 80},
  {text: "6'8", value: 81},
  {text: "6'9", value: 82},
];

export const findHeightString = (inches: number): string | undefined => {
  return heights.find(height => height.value === inches)!.text;
};