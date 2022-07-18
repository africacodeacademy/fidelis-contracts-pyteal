from pyteal import *
from pyteal.ast.bytes import Bytes
from pyteal_helpers import program


def approval():
    # globals
    balance = Bytes("balance")
    start_date = Bytes("start_date")
    end_date = Bytes("end_date")
    interest_rate = Bytes("interest_rate")
    loan_amount = Bytes("loan_amount")
    beneficiary_address = Bytes("beneficiary")
    beneficiary_stake = Bytes("beneficiary_stake")
    reserve_address = Bytes("reserve_address")
    # admin_address = Bytes("admin_address")
    agent_address = Bytes("agent_address"),
    assetId = Bytes("assetId")
    pool_address = Bytes("pool_address")
    staked_tokens = Bytes("staked_tokens")

    # scratch_space

    accounts_length = ScratchVar(TealType.uint64)
    backers_length = ScratchVar(TealType.uint64)


    # finished,  needs testing
    @Subroutine(TealType.uint64)
    def check_txn_conditions(idx:Expr):
        return Seq(
            # program.check_rekey_zero()
                
                And(
                    Gtxn[idx].type_enum() == TxnType.AssetTransfer,
                    # App.optedIn(transaction.asset_sender(), Global.current_application_id()),
                    Gtxn[idx].asset_receiver() == Global.current_application_address(),
                    Gtxn[idx].asset_close_to() == Global.zero_address(),
                )
            
        )

    # Incomplete,  needs testing
    @Subroutine(TealType.uint64)
    def pre_assertions():
        idx = ScratchVar(TealType.uint64)
        backer_end_idx = ScratchVar(TealType.uint64)
        return Seq(
            Assert(
                And(
                    Global.group_size() > Int(2),
                    Gtxn[1].asset_amount() > Int(1),

                )
            ),

            accounts_length.store(Global.group_size()),
            App.globalPut(beneficiary_stake, Gtxn[0].asset_amount()),
            App.globalPut(beneficiary_address, Gtxn[0].asset_sender()),        
            backer_end_idx.store(accounts_length.load()),
            If(check_txn_conditions(Int(0)) == Int(0))
            .Then(
                Seq(                    
                    For(idx.store(Int(4)), idx.load() <= backer_end_idx.load(), idx.store(idx.load() + Int(1)))
                    .Do(                    
                        If(check_txn_conditions(idx.load()) == Int(0))
                        .Then(
                            # tally the staked tokens,
                            Seq(
                                App.globalPut(staked_tokens, App.globalGet(Bytes("staked_tokens")) + Gtxn[idx.load()].asset_amount()),
                                Continue()
                            )
                        )
                        .Else(
                            Seq(
                                Reject()
                            )
                            
                        )
                        
                    ),
                    # check if points match loan amount
                    If(App.globalGet(Bytes("staked_tokens")) != App.globalGet(Bytes("loan_amount")))
                    .Then(
                        Seq(
                            Return(Int(0))
                        )),

                    Return(Int(1))
                )

                
            )
            .Else(
                Return(Int(0))
            )
        )


    # expressions

    payment = Seq(
        # run custom logic
        Approve(),
    )

    force_close = Seq(
    #  run custom logic
        Approve(),
    )

    register_agent = Seq(
        # App.globalPut(agent_address, Txn.accounts[1]),
        Approve()
    )

    
    check_default = Seq(
        # run custom logic
        Approve(),
    )

    handle_creation = Seq(
        #TODO: CHECK if args are valid

        App.globalPut(loan_amount, Txn.application_args[1]),
        App.globalPut(interest_rate, Txn.application_args[2]),
        App.globalPut(start_date, Txn.application_args[3]),
        App.globalPut(end_date, Txn.application_args[4]),
        App.globalPut(reserve_address, Txn.application_args[5]),
        App.globalPut(pool_address, Txn.application_args[6]),
        # App.globalPut(assetId, "get assettid from --foreign-asset arg"),

        Approve()
    )

    #needs testing
    @Subroutine(TealType.none)
    def initialize_loan():
        return Seq(
            If(pre_assertions() == Int(1))
            .Then(
                Seq(
                    Reject()
                )
            ),
            #update loan balance
            App.globalPut(balance,  App.globalGet(Bytes("loan_amount"))+ (App.globalGet(Bytes("loan_amount")) * (App.globalGet(Bytes("interest_rate"))/Int(100)))),
            # move USDCa to agent address
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields(
                {
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.asset_receiver: App.globalGet(Bytes("agent_address")),
                    TxnField.asset_amount: App.globalGet(Bytes("loan_amount")),
                    TxnField.xfer_asset: Txn.assets[0],
                    TxnField.asset_sender: App.globalGet(Bytes("pool_address"))
                }
            ),
            InnerTxnBuilder.Submit(),

            # Approve()
        )
    
    

    return program.event(
        init=handle_creation,
        opt_in=Seq(
            Cond(
                [Txn.application_args[0] == Bytes("register_agent"), register_agent],
            ),
            Approve()
        ),

        no_op=Seq(
            Cond(
                [Txn.application_args[0] == Bytes("apply"), initialize_loan()],
                [Txn.application_args[0] == Bytes("payment"), payment],
                [Txn.application_args[0] == Bytes("force_close"), force_close],
                [Txn.application_args[0] == Bytes("check_default"), check_default]
            ),
            Reject()
        )

    )


def clear():
    return Approve()
