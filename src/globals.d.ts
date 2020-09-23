// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IsMockProp, SpyOnProp } from "./types";

declare global {
    namespace jest {
        const isMockProp: IsMockProp;
        const spyOnProp: SpyOnProp;
    }
}
