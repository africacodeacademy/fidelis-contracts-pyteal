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
    staked_amount = Bytes("staked_amount")
    beneficiary_address = Bytes("beneficiary")
    reserve_address = Bytes("reserve_address")
    pool_address = Bytes("pool_address")
    loan_state = Bytes('loan_state')
    agent_address = Bytes('agent_address')
    stable_token = Bytes('stable_token')
    manager = Bytes('manager')

    # expressions
    force_close = Seq(
    #  run custom logic
        Approve(),
    )

    
    check_default = Seq(
        # run custom logic
        Approve(),
    )


    # initialize contract
        # loan amount
        # loan balance
        # start time
        # end time
        # interest rate
        # beneficiary address
        # rekey address //missing
        # pool_address
        # reserve_address

        # Preconditions
        #   loan amount > 0
        #   interest rate > 0
        #   end time > start time
        #   agent address must be opted in to interacting with USDCa token // missing
        #   
    handle_creation = Seq(
        Assert(Btoi(Txn.application_args[1]) > Int(0)), #check valid loan amount
        Assert(Btoi(Txn.application_args[2]) > Int(0)), #check valid interest rate
        Assert(Btoi(Txn.application_args[4]) > Btoi(Txn.application_args[3])), #check valid dates
        App.globalPut(balance,  Btoi(Txn.application_args[1])+ (Btoi(Txn.application_args[1])* (Btoi(Txn.application_args[2])/Int(100)))),
        App.globalPut(loan_amount, Btoi(Txn.application_args[1])),
        App.globalPut(interest_rate, Btoi(Txn.application_args[2])),
        App.globalPut(start_date, Btoi(Txn.application_args[3])),
        App.globalPut(end_date, Btoi(Txn.application_args[4])),
        App.globalPut(reserve_address, Txn.application_args[5]),
        App.globalPut(pool_address, Txn.application_args[6]),
        App.globalPut(beneficiary_address, Txn.application_args[7]),
        App.globalPut(agent_address, Txn.accounts[4]),
        App.globalPut(stable_token, Txn.assets[0]),
        App.globalPut(loan_state, Bytes('openToInvestment')),
        App.globalPut(staked_amount, Int(0)),
        App.globalPut(manager, Txn.sender()),
        Approve()
    )


    @Subroutine(TealType.none)
    def invest():
        # allow  account to fund escrow account with backer and trust tokens
        # update account local state with investment amount and key
        # preconditions:
        #       must have enough tokens
        #       proposed stake + total staked tokens must be <= loan amount
        inverstorAssetBalance = AssetHolding.balance(Txn.sender(), Txn.assets[0])
        return Seq(
                Assert(App.globalGet(loan_state) == Bytes('openToInvestment')),
                Assert((Btoi(Txn.application_args[1]) + App.globalGet(staked_amount)) <= App.globalGet(loan_amount)), # The backer ending fails this assertion
                Assert(Btoi(Txn.application_args[1]) > Int(0)), #check investment amount > 0
                inverstorAssetBalance,
                Assert(inverstorAssetBalance.hasValue()),
                # Assert(inverstorAssetBalance.value() >= Btoi(Txn.application_args[1])),
                
                ## 
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                   {
                       TxnField.type_enum: TxnType.AssetTransfer,
                       TxnField.asset_receiver: Global.current_application_address(),
                       TxnField.asset_amount: Btoi(Txn.application_args[1]),
                       TxnField.xfer_asset: Txn.assets[0],
                       TxnField.sender: Txn.sender() 
                   }
                ),
                InnerTxnBuilder.Submit(),
                
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes("_key")),  Txn.application_args[2]),
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_amount')),  Btoi(Txn.application_args[1])),
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_asset')),  Txn.assets[0]),
                App.globalPut(staked_amount, App.globalGet(staked_amount) + Btoi(Txn.application_args[1])),
                If(App.globalGet(staked_amount) >= App.globalGet(loan_amount))
                .Then(
                    Seq(
                        App.globalPut(loan_state, Bytes('alive')),
                        InnerTxnBuilder.Begin(),
                        InnerTxnBuilder.SetFields(
                            {
                                TxnField.type_enum: TxnType.AssetTransfer,
                                TxnField.asset_receiver: App.globalGet(agent_address),
                                TxnField.asset_amount: App.globalGet(loan_amount),
                                TxnField.xfer_asset: App.globalGet(stable_token),
                                TxnField.sender: App.globalGet(pool_address),
                            }
                        ),
                        InnerTxnBuilder.Submit(),
                    )
                )
            )

    @Subroutine(TealType.none)
    def reclaim():
        # allow backers  to relcaim  staked points,
        # update account local state with investment amount
        # preconditions: 
        #       must have backed this loan, check  local state for public key
        #       loan must be matured, i.e loan repaid 100%

        return Seq(
                Assert(App.globalGet(Bytes('loan_state')) == Bytes('matured')),
                Assert(App.localGet(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_key'))) != Int(0)),
                # TODO:: Validate encryption key

                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: Txn.sender(),
                        TxnField.asset_amount: App.localGet(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_amount'))), #amount
                        TxnField.xfer_asset: App.localGet(Txn.sender(), Concat(Itob(Txn.application_id()),Bytes('_asset'))),
                        TxnField.sender: Global.current_application_address()
                    }
                ),
                InnerTxnBuilder.Submit(),
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_amount')),  Int(0)),
                Approve(),
            )

    @Subroutine(TealType.none)
    def escrow_config():
        # Configuring the escrow account
        return Seq(
                Assert(App.globalGet(Bytes("manager")) == Txn.sender()),
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: Global.current_application_address(),
                        TxnField.asset_amount: Int(0),
                        TxnField.xfer_asset: Txn.assets[0],
                        TxnField.sender: Global.current_application_address(),
                    }
                ),
                InnerTxnBuilder.Submit(),
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: Global.current_application_address(),
                        TxnField.asset_amount: Int(0),
                        TxnField.xfer_asset: Txn.assets[1],
                        TxnField.sender: Global.current_application_address(),
                    }
                ),
                InnerTxnBuilder.Submit(),
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: Global.current_application_address(),
                        TxnField.asset_amount: Int(0),
                        TxnField.xfer_asset: Txn.assets[2],
                        TxnField.sender: Global.current_application_address(),
                    }
                ),
                InnerTxnBuilder.Submit(),
            )


    @Subroutine(TealType.none)
    def repay():
        # allow  account to transfer USDCa tokens to liquidity pool as loan payment
        # preconditions:
        #       must have enough tokens
        agentAssetBalance = AssetHolding.balance(Txn.sender(), Txn.assets[0])
        return Seq(
                Assert(Btoi(Txn.application_args[1]) > Int(0)), #check payment amount > 0
                Assert(App.globalGet(balance) >= Btoi(Txn.application_args[1])),
                agentAssetBalance,
                Assert(agentAssetBalance.hasValue()),
                Assert(agentAssetBalance.value() >= Btoi(Txn.application_args[1])),

                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: App.globalGet(pool_address),
                        TxnField.asset_amount: Btoi(Txn.application_args[1]), #amount
                        TxnField.xfer_asset: Txn.assets[0],
                        TxnField.sender: Txn.sender() #agent address
                    }
                ),
                InnerTxnBuilder.Submit(),   
                App.globalPut(balance, App.globalGet(balance) - Btoi(Txn.application_args[1])),
                If(App.globalGet(balance) == Int(0))
                .Then(
                    Seq(
                        App.globalPut(loan_state, Bytes('matured'))
                    )
                )
            )

    return program.event(
        init=handle_creation,
        opt_in= Approve(),
        no_op=Seq(
            Cond(
                [Txn.application_args[0] == Bytes("payment"), repay()],
                [Txn.application_args[0] == Bytes("reclaim"), reclaim()],
                [Txn.application_args[0] == Bytes("invest"), invest()],
                [Txn.application_args[0] == Bytes("config"), escrow_config()],
                [Txn.application_args[0] == Bytes("force_close"), force_close],
                [Txn.application_args[0] == Bytes("check_default"), check_default]
            ),
            Approve()
        )

    )


def clear():
    return Approve()