import { SettingsService } from './settings.service';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getSetting(key: string): Promise<any>;
    saveSetting(key: string, body: any): Promise<any>;
}
