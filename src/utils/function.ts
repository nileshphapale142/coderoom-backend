interface types {
    min: number;
    max: number;
    prob: number;
}


export function getRandomIntInclusive(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function CourseCodeGenerator() {
    const digits:types = {min: 48, max: 57, prob: 0.16};
    const smallAlpha: types = {min: 97, max: 122, prob: digits.prob + 0.42}
    const  bigAlpha: types = {min: 65, max: 90, prob: smallAlpha.prob + 0.42}
    
    const letters:types[] = [digits, smallAlpha, bigAlpha]

    let courseCode:string = "";

    while (courseCode.length !== 5) {
        const rand = Math.random();
        const idx = (rand <= digits.prob) ? 0 : (rand <= smallAlpha.prob) ? 1 : 2;

        const asciiCode = getRandomIntInclusive(letters[idx].min, letters[idx].max);
        courseCode += String.fromCharCode(asciiCode)

    }

    return courseCode;
}


export function toBase64(str :string) {
    return Buffer.from(str, 'utf-8').toString('base64')
}

export function toString(str: string | null):string  {
    if (!str) return '';
    return Buffer.from(str, 'base64').toString('utf-8')
}


export function convertToUTC(indianTimeString:string, dateString:string) {
  const indianTime = new Date(`${dateString}T${indianTimeString}:00+05:30`);
  return indianTime.toUTCString();
}

export function convertToIndianTime(utcDate) {
  return new Date(utcDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

export function combineDateAndTime(dateString: string, timeString: string): Date {
  const combinedString = `${dateString}T${timeString}:00.000`;
  return new Date(combinedString);
}