import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ValuesPipe } from "./app-values.pipe";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "src/environments/environment";

@NgModule({
    declarations: [
        AppComponent,
        ValuesPipe
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        ServiceWorkerModule.register("ngsw-worker.js", {
            enabled: environment.production,
            /* Register the ServiceWorker as soon as the app is stable
			   or after 30 seconds (whichever comes first). */
            registrationStrategy: "registerWhenStable:30000"
        })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule { }
