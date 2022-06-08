import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "values" })
export class ValuesPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    public transform(values: Record<any, any>[]): any {
        const result = [];
        for (const value of values) {
            result.push(Object.values(value));
        }
        console.log(result);
        return result;
    }
}
