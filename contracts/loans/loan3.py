from pyteal import *
from pyteal.ast.bytes import Bytes
from pyteal_helpers import program


def approval():
    # globals
    balance = Bytes("balance")
    start_date = Bytes("start_date")
    end_date = Bytes("end_date")
    fee = Bytes("fee")
    loan_amount = Bytes("loan_amount")
    staked_amount = Bytes("staked_amount")
    beneficiary_address = Bytes("beneficiary")
    pool_address = Bytes("pool_address")
    loan_state = Bytes('loan_state')
    agent_address = Bytes('agent_address')
    stable_token = Bytes('stable_token')
    trust_token = Bytes('trust_token')
    backer_token = Bytes('backer_token')
    manager = Bytes('manager')


    
    @Subroutine(TealType.none)
    def defaultContract():
        # get usd tokens held in escrow and send to pool
        escrow_usdc_balance = AssetHolding.balance(Global.current_application_address(), App.globalGet(stable_token))
        escrow_ftt_balance = AssetHolding.balance(Global.current_application_address(), App.globalGet(trust_token))
        escrow_fbt_balance = AssetHolding.balance(Global.current_application_address(), App.globalGet(backer_token))

        return Seq(
                Assert(Txn.close_remainder_to() ==  Global.zero_address()),
                Assert(Txn.rekey_to() == Global.zero_address()),
                Assert(App.globalGet(Bytes("manager")) == Txn.sender()),
                # Assert(Global.latest_timestamp() > App.globalGet(end_date)),
                Assert(App.globalGet(balance) > Int(0)),
                Assert(Or(
                    App.globalGet(Bytes('loan_state')) == Bytes('alive'),
                    App.globalGet(Bytes('loan_state')) == Bytes('openToInvestment')
                )),

                # send USDC
                escrow_usdc_balance,
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: App.globalGet(pool_address),
                        TxnField.asset_amount: escrow_usdc_balance.value(), 
                        TxnField.xfer_asset: App.globalGet(stable_token),
                        TxnField.sender: Global.current_application_address(), 
                    }
                ),
                InnerTxnBuilder.Submit(),

                #send FTT
                escrow_ftt_balance,
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: App.globalGet(pool_address),
                        TxnField.asset_amount: escrow_ftt_balance.value(), 
                        TxnField.xfer_asset: App.globalGet(trust_token),
                        TxnField.sender: Global.current_application_address(), 
                    }
                ),
                InnerTxnBuilder.Submit(),

                #send FBT
                escrow_fbt_balance,
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: App.globalGet(pool_address),
                        TxnField.asset_amount: escrow_fbt_balance.value(), 
                        TxnField.xfer_asset: App.globalGet(backer_token),
                        TxnField.sender: Global.current_application_address(), 
                    }
                ),
                InnerTxnBuilder.Submit(),
                App.globalPut(loan_state, Bytes('defaulted')),
                
                
            )


    @Subroutine(TealType.none)
    def force_close():
        # get usd tokens held in escrow and send to pool
        escrow_usdc_balance = AssetHolding.balance(Global.current_application_address(), App.globalGet(stable_token))
        escrow_ftt_balance = AssetHolding.balance(Global.current_application_address(), App.globalGet(trust_token))
        escrow_fbt_balance = AssetHolding.balance(Global.current_application_address(), App.globalGet(backer_token))

        return Seq(
                Assert(Txn.close_remainder_to() ==  Global.zero_address()),
                Assert(Txn.rekey_to() == Global.zero_address()),
                Assert(App.globalGet(Bytes("manager")) == Txn.sender()),
                # Assert(Global.latest_timestamp() > App.globalGet(end_date)),
                Assert(App.globalGet(balance) > Int(0)),
                Assert(Or(
                    App.globalGet(Bytes('loan_state')) == Bytes('alive'),
                    App.globalGet(Bytes('loan_state')) == Bytes('openToInvestment')
                )),

                Seq(
                    # send USDC
                    escrow_usdc_balance,
                    InnerTxnBuilder.Begin(),
                    InnerTxnBuilder.SetFields(
                        {
                            TxnField.type_enum: TxnType.AssetTransfer,
                            TxnField.asset_receiver: App.globalGet(pool_address),
                            TxnField.asset_amount: escrow_usdc_balance.value(), 
                            TxnField.xfer_asset: App.globalGet(stable_token),
                            TxnField.sender: Global.current_application_address(), 
                        }
                    ),
                    InnerTxnBuilder.Submit(),

                    #send FTT
                    escrow_ftt_balance,
                    InnerTxnBuilder.Begin(),
                    InnerTxnBuilder.SetFields(
                        {
                            TxnField.type_enum: TxnType.AssetTransfer,
                            TxnField.asset_receiver: App.globalGet(pool_address),
                            TxnField.asset_amount: escrow_ftt_balance.value(), 
                            TxnField.xfer_asset: App.globalGet(trust_token),
                            TxnField.sender: Global.current_application_address(), 
                        }
                    ),
                    InnerTxnBuilder.Submit(),

                    #send FBT
                    escrow_fbt_balance,
                    InnerTxnBuilder.Begin(),
                    InnerTxnBuilder.SetFields(
                        {
                            TxnField.type_enum: TxnType.AssetTransfer,
                            TxnField.asset_receiver: App.globalGet(pool_address),
                            TxnField.asset_amount: escrow_fbt_balance.value(), 
                            TxnField.xfer_asset: App.globalGet(backer_token),
                            TxnField.sender: Global.current_application_address(), 
                        }
                    ),
                    InnerTxnBuilder.Submit(),
                    App.globalPut(loan_state, Bytes('defaulted')),
                )
                
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
        #   interest rate / fee > 0
        #   end time > start time
        #   agent address must be opted in to interacting with USDCa token // missing
        #   
    handle_creation = Seq(
        Assert(Btoi(Txn.application_args[1]) > Int(0)), #check valid loan amount
        Assert(Btoi(Txn.application_args[2]) > Int(0)), #check valid fee
        # Assert(Global.latest_timestamp() > (Btoi(Txn.application_args[3])*Int(100))), #check loan start timestamp
        # Assert(Global.latest_timestamp() > (Btoi(Txn.application_args[4])*Int(100))), #check loan end timestamp
        # Assert(Btoi(Txn.application_args[4]) > Btoi(Txn.application_args[3])), #check valid dates
        App.globalPut(balance,  Btoi(Txn.application_args[1])+Btoi(Txn.application_args[2])), #assign new balance (loan amount + interest fee)
        App.globalPut(loan_amount, Btoi(Txn.application_args[1])), #store original loan amount before interest
        App.globalPut(fee, Btoi(Txn.application_args[2])), #store interest fee
        App.globalPut(start_date, Btoi(Txn.application_args[3])*Int(100)), #store loan start time
        App.globalPut(end_date, Btoi(Txn.application_args[4])*Int(100)), #store loan end time
        App.globalPut(pool_address, Txn.accounts[1]), #store pool address for future ref
        App.globalPut(beneficiary_address, Txn.accounts[2]), #store beneficiary address for future ref
        App.globalPut(agent_address, Txn.accounts[3]), #store agnet address for future ref
        App.globalPut(stable_token, Txn.assets[0]), #store txn token for future ref
        App.globalPut(trust_token, Txn.assets[1]), #store txn token for future ref
        App.globalPut(backer_token, Txn.assets[2]), #store txn token for future ref
        App.globalPut(loan_state, Bytes('openToInvestment')), # store initial loan state
        App.globalPut(staked_amount, Int(0)), # store initial staked amount
        App.globalPut(manager, Txn.sender()), #store manager address
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
        Approve()
    )


    @Subroutine(TealType.none)
    def invest():
        # allow  investors to fund escrow account with backer and trust tokens
        # update account local state with investment amount and key
        # preconditions:
        #       must have enough tokens
        #       proposed stake + total staked tokens must be <= loan amount
        #
        #   Missing verify asset tokens against known expected tokens
        return Seq(
                Assert(App.globalGet(loan_state) == Bytes('openToInvestment')),
                # Assert(Global.latest_timestamp() < App.globalGet(end_date)),
                Assert(Txn.close_remainder_to() ==  Global.zero_address()),
                Assert(Gtxn[0].type_enum() == TxnType.AssetTransfer),
                Assert(Gtxn[0].rekey_to() == Global.zero_address()),
                Assert(Gtxn[1].rekey_to() == Global.zero_address()),
                Assert(Gtxn[0].asset_sender() == Txn.sender()),
                Assert(Gtxn[1].asset_sender() == Txn.sender()),
                Assert(Gtxn[0].asset_close_to() == Global.zero_address()),
                Assert(Gtxn[1].asset_close_to() == Global.zero_address()),
                Assert(Gtxn[0].asset_receiver() == Global.current_application_address()),
                Assert(Gtxn[0].xfer_asset() == Txn.assets[0]),
                Assert(Gtxn[0].asset_amount() > Int(0)),
                Assert((Gtxn[0].asset_amount() + App.globalGet(staked_amount)) <= App.globalGet(loan_amount)),
                
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes("_key")),  Txn.application_args[2]),
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_amount')),  Gtxn[0].asset_amount()),
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_asset')),  Txn.assets[0]),
                App.globalPut(staked_amount, App.globalGet(staked_amount) + Gtxn[0].asset_amount()),
                
                If(App.globalGet(staked_amount) * Int(10000) >= App.globalGet(loan_amount))
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
                                TxnField.sender: Global.current_application_address(),
                            }
                        ),
                        InnerTxnBuilder.Submit(),
                    )
                )
            )

    @Subroutine(TealType.none)
    def reclaim():
        # allow backers to relcaim staked points,
        # update account local state with investment amount
        # preconditions: 
        #       must have backed this loan, check  local state for public key
        #       loan must be matured, i.e loan repaid 100%

        return Seq(
                Assert(App.globalGet(Bytes('loan_state')) == Bytes('matured')),
                Assert(App.localGet(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_amount'))) != Int(0)),
                Assert(Txn.close_remainder_to() ==  Global.zero_address()),
                Assert(Txn.rekey_to() == Global.zero_address()),
                Assert(Txn.asset_close_to() == Global.zero_address()),
                
                # TODO:: Validate encryption key

                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: Txn.sender(),
                        TxnField.asset_amount: App.localGet(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_amount'))), #amount
                        TxnField.xfer_asset: Txn.assets[0], # todo : revert
                        TxnField.sender: Global.current_application_address()
                    }
                ),
                InnerTxnBuilder.Submit(),
                App.localPut(Txn.sender(), Concat(Itob(Txn.application_id()), Bytes('_amount')),  Int(0)),
                Approve(),
            )



    @Subroutine(TealType.none)
    def repay():
        # allow  account to transfer USDCa tokens to liquidity pool as loan payment
        # preconditions:
        #       must have enough tokens
        return Seq(
                Assert(App.globalGet(Bytes('loan_state')) == Bytes('alive')),
                Assert(Gtxn[0].type_enum() == TxnType.AssetTransfer),
                # Assert(Gtxn[0].asset_sender() == Txn.sender()),
                Assert(Gtxn[0].close_remainder_to() ==  Global.zero_address()),
                Assert(Gtxn[0].asset_close_to() == Global.zero_address()),
                Assert(Gtxn[0].asset_receiver() == Global.current_application_address()),
                Assert(Gtxn[0].xfer_asset() == Txn.assets[0]),
                Assert(Gtxn[0].asset_amount() <= App.globalGet(balance)),
                Assert(Gtxn[0].xfer_asset() == App.globalGet(stable_token)),
                Assert(Gtxn[0].asset_amount() >= Int(0)),
                Assert(Gtxn[0].rekey_to() == Global.zero_address()),
                Assert(Gtxn[1].rekey_to() == Global.zero_address()),
                Assert(Gtxn[0].asset_sender() == Txn.sender()),

                App.globalPut(balance, App.globalGet(balance) - Gtxn[0].asset_amount()),
                If(App.globalGet(balance) == Int(0))
                .Then(
                    Seq(
                        App.globalPut(loan_state, Bytes('matured')),
                        InnerTxnBuilder.Begin(),
                        InnerTxnBuilder.SetFields(
                            {
                                TxnField.type_enum: TxnType.AssetTransfer,
                                TxnField.asset_receiver: Txn.accounts[1],
                                TxnField.asset_amount: App.globalGet(loan_amount)+ App.globalGet(fee), #amount
                                TxnField.xfer_asset: Txn.assets[0],
                                TxnField.sender: Global.current_application_address(), 
                            }
                        ),
                        InnerTxnBuilder.Submit(),  
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
                [Txn.application_args[0] == Bytes("force_close"), force_close()],
                [Txn.application_args[0] == Bytes("default_contract"), defaultContract()]
            ),
            Approve()
        )

    )


def clear():
    return Approve()