import {ParameterModel} from "./parameter.model";

export const parameterProviders = [
    {
        provide: 'ParameterRepository',
        useValue: ParameterModel,
    },
];
