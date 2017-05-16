//@flow

declare module ThingA {
    declare type foo = boolean;
    declare type bar = string;
    declare function derp(thing:foo):bar;
}
