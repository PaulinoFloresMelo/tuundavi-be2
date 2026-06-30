
import { createFactory } from 'hono/factory'
import { Env, Variables } from './types';

export const factory = createFactory<{ 
    Bindings: Env,
    Variables: Variables;
}>()