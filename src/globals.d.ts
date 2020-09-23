// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IsMockProp, SpyOnProp } from "jest-mock-props";

declare global {
    namespace jest {
        const isMockProp: IsMockProp;
        const spyOnProp: SpyOnProp;
    }
}
