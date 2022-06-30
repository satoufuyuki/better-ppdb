/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AppService, IPopulateOptionsResponse } from "./app.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
    public isDisabled = false;
    public majorSelectionVisibility = "hidden";
    public options: IPopulateOptionsResponse[] = [];
    // Form Controls
    public form = new FormGroup({});
    public schoolControl = new FormControl("default");
    public jalurControl = new FormControl("default");
    public jurusanControl = new FormControl("default");
    // Selected Values
    public selectedSchool: { id: string; name: string; type: string } | undefined = undefined;
    public selectedOptions!: IPopulateOptionsResponse;
    public selectedJalur: string | undefined = undefined;
    public selectedJurusan: number | undefined = undefined;
    public availableJalur: IPopulateOptionsResponse["options"] = [];
    public availableJurusan: IPopulateOptionsResponse["options"] = [];

    public registrant: { itemsList?: any[] } = {};
    public registrantKeyEntries: string[] = [];
    public registrantValuesEntries: {
        no: number;
        id: string;
        name: string;
        firstOption: string;
        secondOption: string;
        score?: string;
    }[] = [];

    public availableSchools = [
        {
            id: "20217786",
            name: "SMAN 1 Karawang",
            type: "SMA"
        },
        {
            id: "20217764",
            name: "SMAN 3 Karawang",
            type: "SMA"
        },
        {
            id: "20217765",
            name: "SMAN 4 Karawang",
            type: "SMA"
        },
        {
            id: "20237386",
            name: "SMAN 5 Karawang",
            type: "SMA"
        },
        {
            id: "69904548",
            name: "SMAN 6 Karawang",
            type: "SMA"
        },
        {
            id: "20217802",
            name: "SMKN 1 Karawang",
            type: "SMK"
        },
        {
            id: "20217780",
            name: "SMAN 1 Telukjambe",
            type: "SMA"
        },
        {
            id: "69915815",
            name: "SMAN 2 Telukjambe Timur",
            type: "SMA"
        },
        {
            id: "20217763",
            name: "SMAN 2 Karawang",
            type: "SMA"
        }
    ];

    public constructor(private readonly service: AppService) {}


    public async ngOnInit(): Promise<any> {
        await Promise.all(this.availableSchools.map(async (school, i) => {
            const response = await this.service.fetchOptions(school.id).toPromise();
            this.options[i] = response!.result;
        }));
        this.jalurControl.valueChanges.subscribe(async x => {
            if (x === "default") {
                this.majorSelectionVisibility = "hidden";
            }
            if (this.selectedJalur === x) return;
            if (x !== "default") this.majorSelectionVisibility = "visible";
            this.selectedJalur = x;
            if (this.selectedSchool?.type === "SMK") {
                this.jurusanControl.setValue("default");
                this.selectedJurusan = undefined;
            } else if (this.selectedSchool?.type === "SMA") {
                this.toggleOptions();
                const response = await this.service.fetchRegistrant(this.selectedSchool.id, this.selectedJalur!.toString()).toPromise();
                this.registrant = response?.result;
                if (this.registrant.itemsList?.length) {
                    this.parseRegistrant(this.registrant.itemsList);
                }
                this.toggleOptions();
            }
        });
        this.jurusanControl.valueChanges.subscribe(async value => {
            if (this.selectedJurusan === value || this.selectedSchool?.type !== "SMK" || value === "default") return;
            this.selectedJurusan = value;
            this.toggleOptions();
            const response = await this.service.fetchRegistrant(this.selectedSchool.id, this.selectedJalur!, this.selectedJurusan?.toString()).toPromise();
            this.registrant = response?.result;
            if (this.registrant.itemsList?.length) {
                this.parseRegistrant(this.registrant.itemsList);
            }
            this.toggleOptions();
        });
        this.schoolControl.valueChanges.subscribe(value => {
            if (this.selectedSchool !== value) {
                this.selectedJalur = undefined;
                this.selectedJurusan = undefined;
                this.selectedSchool = this.availableSchools.find(s => s.id === value);
                this.selectedOptions = this.options.find(s => s.npsn === value)!;
                this.jalurControl.setValue("default");
                if (this.selectedSchool?.type === "SMK") {
                    this.availableJalur = [
                        ...new Set(this.selectedOptions.options.map(x => x.name.split(" - ").slice(2).join(" - ")))
                    ].map(j => this.selectedOptions.options.find(x => new RegExp(j, "i").exec(x.name))!)
                        .map(j => ({ ...j, name: j.name.split(" - ").slice(2).join(" - ") }));
                    this.availableJurusan = [
                        ...new Set(this.selectedOptions.options.map(x => x.major_id))
                    ].map(j => this.selectedOptions.options.find(x => x.major_id === j)!)
                        .map(j => ({ ...j, name: j.major!.name }));
                } else {
                    this.availableJalur = this.selectedOptions.options;
                }
            }
        });
    }

    public parseRegistrant(data: any): void {
        switch (this.selectedSchool?.type ?? "") {
            case "SMA": {
                this.registrantKeyEntries = [
                    "No",
                    "Nomor Pendaftaran",
                    "Nama",
                    "Pilihan 1",
                    "Pilihan 2",
                    "Score"
                ];
                this.registrantValuesEntries = [];
                let i = 0;
                data = data.sort((a: any, b: any) => a.distance1 - b.distance1);
                for (const registrant of data) {
                    this.registrantValuesEntries.push({
                        no: i + 1,
                        id: registrant.registration_number,
                        name: registrant.name,
                        firstOption: `${registrant.first_option.name} (${registrant.distance1}m)`,
                        secondOption: registrant.second_option ? `${registrant.second_option.name} (${registrant.distance2}m)` : "-",
                        score: registrant.score === 0 ? "-" : registrant.score
                    });
                    i += 1;
                }
                break;
            }
            case "SMK": {
                this.registrantKeyEntries = [
                    "No",
                    "Nomor Pendaftaran",
                    "Nama",
                    "Pilihan 1",
                    "Pilihan 2"
                ];
                this.registrantValuesEntries = [];
                let i = 0;
                for (const registrant of data) {
                    this.registrantValuesEntries.push({
                        no: i + 1,
                        id: registrant.registration_number,
                        name: registrant.name,
                        firstOption: `${registrant.first_option.name} (${registrant.distance1}m) ${registrant.score_a1 ? `(Skor: ${registrant.score_a1.toFixed(1)})` : ""}`,
                        secondOption: registrant.second_option ? `${registrant.second_option.name} (${registrant.distance2}m) ${registrant.score_a2 ? `(Skor: ${registrant.score_a2.toFixed(1)})` : ""}` : "-"
                    });
                    i += 1;
                }
                break;
            }
            default:
                break;
        }
    }

    private toggleOptions(): void {
        if (this.form.disabled) this.form.disable();
        this.form.enable();
    }
}
