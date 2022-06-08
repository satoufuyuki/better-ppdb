/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface IPPDBResponse<T> {
    code: number;
    message: string;
    result: T;
    status: string;
}

export interface IPopulateOptionsResponse {
    address: string;
    address_city: string;
    address_district: string;
    address_province: string;
    address_rt: string;
    address_rw: string;
    address_subdistrict: string;
    coordinate_lat: string;
    coordinate_lng: string;
    level: string;
    name: string;
    npsn: string;
    options: {
        major?: {
            name: string;
            parent: number;
        };
        major_id?: number;
        name: string;
        no_color_blind: boolean;
        quota: number;
        type: string;
    }[];
    type: "negeri";
}

@Injectable({
    providedIn: "root"
})
export class AppService {
    public baseURL = "https://api-ppdbjabar.deltamaya.tech";
    public constructor(private readonly http: HttpClient) {}

    public fetchOptions(id: string): Observable<IPPDBResponse<IPopulateOptionsResponse>> {
        return this.http.get<IPPDBResponse<IPopulateOptionsResponse>>(`${this.baseURL}/portal/school/${id}?populate=options`);
    }

    public fetchRegistrant(schoolId: string, jalur: string, jurusan?: string): Observable<IPPDBResponse<any>> {
        const params: Record<string, any> = {
            pagination: false,
            orderby: "created_at",
            order: "asc",
            "columns[0][key]": "name",
            "columns[0][searchable]": true,
            "columns[1][key]": "registration_number",
            "columns[1][searchable]": true,
            "filters[0][key]": "first_school.npsn",
            "filters[0][value]": schoolId,
            "filters[1][key]": "option_type",
            "filters[1][value]": jalur
        };
        if (jurusan !== undefined) {
            Object.assign(params, {
                "filters[2][key]": "first_option.major_id",
                "filters[2][value]": jurusan
            });
        }
        return this.http.get<IPPDBResponse<any>>(`${this.baseURL}/portal/registrant`, {
            params
        });
    }
}
