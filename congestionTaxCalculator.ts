import * as fs from 'fs';
import moment from 'moment';
import Vehicle from "./vehicle";

enum TollFreeVehicles {
    Motorcycle,
    Tractor,
    Emergency,
    Diplomat,
    Foreign,
    Military
}

export function getTax(vehicle: Vehicle, datesIn: Date[]): number {
    const maxFee = 60;
    const city = 'Gothenburg'; // In preparation for use in other locations
    const datesSorted = datesIn.sort();
    const thisDate = (moment(datesSorted[0])).format('yyyy-MM-dd');
    // TODO: We are using the fact that there is more than an hour with 0 toll at midnight, so the interval of passages right before midnight will no affect the toll paid. Otherwise we would need the interval to start the day before
    const dates = datesSorted.filter(dateTime => { return (moment(dateTime)).format('yyyy-MM-dd') === thisDate });
    const otherDates = datesSorted.filter(dateTime => { return (moment(dateTime)).format('yyyy-MM-dd') !== thisDate });
    // TODO: Recuresion i beautiful but it is better to rewrite this as a loop instead
    const otherDaysTax = otherDates.length > 0 ? getTax(vehicle, otherDates) : 0;

    let totalFee = 0;
    let stillIsPassagesLeft = true;
    let intervalStartDate = moment(dates[0]);

    while (stillIsPassagesLeft && totalFee < maxFee) {
        const intervalEndDate = (moment(intervalStartDate)).add(moment.duration(1, 'hours'));
        const interval = dates.filter(date => { return moment(date).isSameOrAfter(intervalStartDate) && moment(date).isBefore(intervalEndDate) });
        let intervalFee = 0;
        interval.forEach(dateTime => {
            intervalFee = Math.max(intervalFee, getTollFee(dateTime, vehicle, city));
        });
        totalFee = Math.min(maxFee, intervalFee + totalFee);
        const passagesAfterInterval = dates.filter(date => { return moment(date).isSameOrAfter(intervalEndDate) });
        if (passagesAfterInterval.length > 0) {
            intervalStartDate = moment(passagesAfterInterval[0]);
        } else {
            stillIsPassagesLeft = false;
        }
    }

    return totalFee + otherDaysTax;
}

function isTollFreeVehicle(vehicle: Vehicle): boolean {
    if (vehicle == null) return false;
    const vehicleType: string = vehicle.getVehicleType();

    return vehicleType == TollFreeVehicles[TollFreeVehicles.Motorcycle] ||
        vehicleType == TollFreeVehicles[TollFreeVehicles.Tractor] ||
        vehicleType == TollFreeVehicles[TollFreeVehicles.Emergency] ||
        vehicleType == TollFreeVehicles[TollFreeVehicles.Diplomat] ||
        vehicleType == TollFreeVehicles[TollFreeVehicles.Foreign] ||
        vehicleType == TollFreeVehicles[TollFreeVehicles.Military];
}


/**
 * Finds the toll fee for a specific class of vehicals at a specific date time 
 * in the city supplied or for the default Gothenburg if no city is supplied
 *
 * @param   dateTime  The time of the toll station passage of the vehicle
 * @param   vehicle The vehicle class, Car, Motorcycle, etc
 * @param   city default: 'Gothenburg' - The city of the passage
 * @returns The toll fee
 */
function getTollFee(dateTime: Date, vechicle: Vehicle, city = 'Gothenburg'): number {
    // TODO validate parameters, especially city and dateTime
    if (isTollFreeDate(dateTime) || isTollFreeVehicle(vechicle)) return 0;

    const hour: number = dateTime.getHours();
    const minute: number = dateTime.getMinutes();

    const feesString = fs.readFileSync(`./assets/${city.toLowerCase()}Fees.json`, 'utf8');
    const feesObject = JSON.parse(feesString);
    const fees = new Map<string, number>(); // : { [x: string]: any; } = {};
    const keys: string[] = [];
    feesObject.forEach((feeArray: any[]) => {
        fees.set(feeArray[0], feeArray[1]);
        keys.push(feeArray[0]);
    });
    const feeKey = keys.filter(timeString => { return timeString < (moment(dateTime)).format('HH:mm') }).reverse()[0];
    let fee = fees.get(feeKey);
    if (fee === undefined) {
        fee = 0;
    }
    return fee;
}

export function isTollFreeDate(date: Date): boolean {
    const year: number = date.getFullYear();
    const month: number = date.getMonth() + 1;
    const day: number = date.getDay();
    const dayOfMonth: number = date.getDate();

    if (day == 6 || day == 0) return true;

    if (year == 2013) {
        // TODO verify that day before bank holliday is also free of charge or is Sunday or Saturday, also rework this, there must be some nice module for bank hollidays!
        if ((month == 1 && dayOfMonth == 1) ||
            (month == 3 && (dayOfMonth == 28 || dayOfMonth == 29)) ||
            (month == 4 && (dayOfMonth == 1 || dayOfMonth == 30)) ||
            (month == 5 && (dayOfMonth == 1 || dayOfMonth == 8 || dayOfMonth == 9)) ||
            (month == 6 && (dayOfMonth == 5 || dayOfMonth == 6 || dayOfMonth == 21)) ||
            (month == 7) ||
            (month == 11 && dayOfMonth == 1) ||
            (month == 12 && (dayOfMonth == 24 || dayOfMonth == 25 || dayOfMonth == 26 || dayOfMonth == 31))) {
            return true;
        }
    }
    return false;
}