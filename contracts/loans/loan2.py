from pyteal import *
from pyteal.ast.bytes import Bytes
from pyteal_helpers import program


def approval():

    x = Bytes("x")

    @Subroutine(TealType.none)
    def initialize_loan():

        totalFees = ScratchVar(TealType.uint64)
        i = ScratchVar(TealType.uint64)

        return Seq(
            If(Int(0)  > Int(1))
            .Then(
                 Seq([
                            totalFees.store(Int(0)),
                            For(i.store(Int(0)), i.load() < Global.group_size(), i.store(i.load() + Int(1))).Do(
                                totalFees.store(totalFees.load() + Gtxn[i.load()].fee())
                            ),
                            # Return(Int(0))
                        ])
            )
        )
        
    
    

    return program.event(
        init=Seq(
            initialize_loan(),
            Approve()
        ),
        opt_in=Approve(),

        no_op=Approve(),

    )


def clear():
    return Approve()
