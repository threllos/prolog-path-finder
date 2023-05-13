:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_server)).
:- use_module(library(http/http_json)).
:- use_module(library(uuid)).

:- initialization
	server(5050).

server(Port) :-
	http_server(http_dispatch, [port(Port)]).

:- http_handler(root(.), http_reply_file('./web/index.html', []), []).
:- http_handler(root('script.js'), http_reply_file('./web/script.js', []), []).
:- http_handler(root('style.css'), http_reply_file('./web/style.css', []), []).

:- http_handler(root(paths), paths_handler, []).

:- dynamic
    cell/3,
    limits/2.

paths_handler(Request) :-
    http_read_json_dict(Request, _{
        limits: Limits, start: Start, finish: Finish, walls: Walls}),
    uuid(Id),
    assert_data(Id, Limits, Start, Finish, Walls),
    findall(Path, path(Id, Path), Paths),
    retract_data(Id),
    paths_sort(Paths, SortedPaths),
    dict_create(Data, _, [paths-SortedPaths]),
    dict_create(Response, _, [data-Data, format-json, opcode-text]),
    reply_json_dict(Response).

assert_data(Id, Limits, Start, Finish, Walls) :-
    assertz(limits(Id, Limits)),
    assertz(cell(Id, Finish, finish)),
    assertz(cell(Id, Start, start)),
    assert_walls(Id, Walls).

assert_walls(_, []) :- !.

assert_walls(Id, [Wall|WallsTail]) :-
    assertz(cell(Id, Wall, wall)),
    assert_walls(Id, WallsTail).

retract_data(Id) :-
    retract(limits(Id, _)),
    retractall(cell(Id, _, _)).

paths_sort(Paths, Sorted) :-
    maplist(path_len, Paths, PathsWithLen),
    keysort(PathsWithLen, SortedPathsWithLen),
    maplist(path_without_len, SortedPathsWithLen, Sorted).

path_len(Path, Len-Path) :-
    length(Path, Len).

path_without_len(_-Path, Path).

outside([X, _]) :-
	X < 0.
outside([X, _]) :-
	limits(_, [LimitX, _]),
	X > LimitX.
outside([_, Y]) :-
	Y < 0.
outside([_, Y]) :-
	limits(_, [_, LimitY]),
	Y > LimitY.

asrt(Id, Next, Visited, Result) :-
    not(cell(Id, Next, wall)),
    not(outside(Next)),
    not(member(Next, Visited)),
    append(Visited, [Next], NewVisited),
    step(Id, Next, NewVisited, Result).

step(Id, From, Visited, Result) :-
    cell(Id, From, finish),
    Result = Visited, !.

step(Id, [FromX, FromY], Visited, Result) :-
    NextX is FromX + 1,
    Next = [NextX, FromY],
    asrt(Id, Next, Visited, Result).

step(Id, [FromX, FromY], Visited, Result) :-
    NextX is FromX - 1,
    Next = [NextX, FromY],
    asrt(Id, Next, Visited, Result).

step(Id, [FromX, FromY], Visited, Result) :-
    NextY is FromY + 1,
    Next = [FromX, NextY],
    asrt(Id, Next, Visited, Result).

step(Id, [FromX, FromY], Visited, Result) :-
    NextY is FromY - 1,
    Next = [FromX, NextY],
    asrt(Id, Next, Visited, Result).

path(Id, Result) :-
    cell(Id, Start, start),
    step(Id, Start, [Start], Result).
