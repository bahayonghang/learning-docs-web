import type { Chapter } from '../types';

export const forecastingChapters: Chapter[] = [
  {
    "id": "13",
    "moduleId": "forecasting",
    "title": {
      "zh": "预测负荷、风电与光伏",
      "en": "Forecasting demand, wind, and solar"
    },
    "subtitle": {
      "zh": "先定义何时预测什么，再选择数据与模型。",
      "en": "Define what is forecast, and when, before choosing a model."
    },
    "minutes": 23,
    "prerequisites": [
      "05",
      "08",
      "09"
    ],
    "objectives": {
      "zh": [
        "写清预测对象、时间粒度和发布时刻。",
        "区分负荷、可再生能源出力与净负荷。",
        "从季节性基线逐步建立可验证的预测模型。"
      ],
      "en": [
        "Specify the target, resolution, and forecast issue time.",
        "Distinguish demand, renewable output, and net demand.",
        "Build a verifiable model starting from a seasonal baseline."
      ]
    },
    "tags": {
      "zh": [
        "负荷预测",
        "风光预测",
        "净负荷",
        "可用信息"
      ],
      "en": [
        "load forecasting",
        "renewable forecasts",
        "net load",
        "available information"
      ]
    },
    "figure": "forecasting",
    "figureCaption": {
      "zh": "历史与外部信息，为未来提供线索",
      "en": "History and external information offer clues about the future"
    },
    "figureNotes": {
      "zh": [
        "历史记录代表发布时刻以前已知的测量值。",
        "天气与生产信息要区分预报、计划和事后实际值。",
        "未来的多条带状路径表示可能情景，不是已经观测到的曲线。"
      ],
      "en": [
        "Historical records represent measurements known before issuance.",
        "Separate weather forecasts and production plans from realized outcomes.",
        "The future ribbons represent scenarios, not measurements already observed."
      ]
    },
    "sections": [
      {
        "id": "target",
        "title": {
          "zh": "先把任务写成一句完整的话",
          "en": "Write a complete forecasting task"
        },
        "body": {
          "zh": "“预测明天用多少电”还不够具体。一个可实施的任务是：每天 10:00，用此前可获得的数据，预测次日每个 15 分钟区间的平均功率，单位 MW。预测对象是一个工厂、一组零售用户，还是全省系统，会改变特征、数据量和误差含义。\n\n把预测发布时刻记为 $t$，目标记为 $y_{t+h}$，预测是 $\\hat y_{t+h|t}$。竖线右侧的 $t$ 提醒你：模型只能使用在 $t$ 时已知的信息。要同时记录目标区间、时区、预测跨度、计量更新时间和缺失值规则。预测曲线转电量时，逐段乘以 $\\Delta t$；96 个区间不等于 96 小时。",
          "en": "“Predict tomorrow’s electricity” is incomplete. A workable task is: at 10:00 each day, using information available by that time, forecast the average MW demand in every 15-minute interval of the following day. A factory, a retailer’s customer portfolio, and a whole power system require different features and have different error interpretations.\n\nWrite the prediction as $\\hat y_{t+h|t}$, issued at time $t$ for target $y_{t+h}$. The conditioning time is a reminder that the future is not available. Record target intervals, time zone, horizon, meter publication delays, and missing-data rules. Convert predicted power to energy by multiplying each interval by $\\Delta t$; 96 quarter-hour intervals are not 96 hours."
        }
      },
      {
        "id": "features",
        "title": {
          "zh": "三个对象，三种因果线索",
          "en": "Three targets, three sets of drivers"
        },
        "body": {
          "zh": "用电负荷受工作日、气温、班次、设备检修和生产计划影响；风电受风速、风向、空气密度、机组状态和限电影响；光伏受辐照、云量、温度、太阳位置及逆变器状态影响。同一个神经网络可以接收不同特征，但特征不能靠名字代替物理含义。\n\n若把系统总需求 $D_t$ 扣除风电 $W_t$ 与光伏 $S_t$，得到教学中的净负荷 $N_t=D_t-W_t-S_t$。它近似描述其余资源需要补足的部分，但还没有加入跨区交换、损耗、其他电源和储能动作。不要把某售电公司的客户负荷直接等同于全系统净负荷。",
          "en": "Demand responds to calendars, temperature, shifts, maintenance, and production plans. Wind output depends on wind conditions, air density, turbine availability, and curtailment. Solar output depends on irradiance, cloud, temperature, solar position, and equipment availability. A neural network can accept these features, but their physical meaning and availability still matter.\n\nA teaching definition of net load is $N_t=D_t-W_t-S_t$: demand less wind and solar. This approximates what other resources must supply, before accounting for exchanges, losses, other generation, and storage actions. A retailer’s customer demand is not automatically the same target as system net load."
        }
      },
      {
        "id": "baseline",
        "title": {
          "zh": "从可用的季节性基线开始",
          "en": "Start with an available seasonal baseline"
        },
        "body": {
          "zh": "先建立信息确实可用的季节性朴素预测。对于每天10:00发布次日完整曲线的任务，可以用“上周同刻”：$\\hat y_t=y_{t-672}$，这里明确使用15分钟采样，一周有672个区间。“昨日同刻”只有在该实际值已发布时才能使用：今天10:00还不知道今天23:00的负荷，不能拿它预测明天23:00。也可选发布时已完整观测的最近可用日曲线。基线便宜、可解释，还能暴露时间对齐问题。再加入日历和天气的线性模型，最后比较树模型、MLP、LSTM 或其他序列网络。是否值得增加复杂度，由独立测试期决定。\n\n清洗停机、缺测和异常值时保留原因标记。真实停产可能是重要事件，不应一律平滑掉。标准化参数只用训练集拟合。每一次模型比较必须使用相同的预测发布时刻、测试窗口和可用特征，否则提高的分数可能只来自更容易的信息条件。",
          "en": "For a forecast issued at 10:00 for the entire following day, use an available seasonal naive baseline, such as $\\hat y_t=y_{t-672}$ for quarter-hour data: the same slot last week, 672 intervals earlier. A same-slot-yesterday actual is valid only after it has been published. At 10:00 today, today’s 23:00 demand is not yet known and cannot predict tomorrow’s 23:00 demand. Another option is the latest fully observed available daily profile. Such baselines are cheap, interpretable, and useful for detecting alignment mistakes. Add a calendar-and-weather linear model before testing trees, MLPs, LSTMs, or other sequence networks. An independent evaluation window determines whether complexity pays off.\n\nKeep reason codes when treating outages, missing readings, and anomalies. A genuine shutdown may be a valuable event rather than noise to smooth away. Fit preprocessing on training data only. Compare models using the same issue time, test window, and information availability; otherwise a better score may simply reflect easier information conditions."
        }
      },
      {
        "id": "decision",
        "title": {
          "zh": "让预测输出服务于采购",
          "en": "Make forecasts useful for procurement"
        },
        "body": {
          "zh": "一条点预测曲线回答最可能或平均会发生什么；采购决策还需要知道上下偏差的可能性。可同时输出中位数、较高分位数和对应的预测区间，并按高温、检修、停产等事件检查误差。多个用户聚合时，误差可能抵消，也可能因共同天气或节假日一起放大。\n\n本章实验用确定性的合成日曲线展示这些关系，不训练真实工业模型。你可以修改温度、模型敏感度或偏置，观察基线和特征模型如何变化。把某一时段预测得到的 MW 转为 MWh，再带到第 18 课的结算模型，才能看到预测误差与电价误差共同作用后的业务结果。",
          "en": "A point forecast describes a conditional mean, median, or another central estimate. Procurement also needs the likelihood of upward and downward deviations. Report quantiles or intervals and inspect errors during heat, maintenance, shutdowns, and other important events. Aggregating customers may cancel errors, but shared weather and calendars can also make errors move together.\n\nThe experiment uses deterministic synthetic daily curves; it does not train an industrial forecasting system. Change temperature, model sensitivity, or bias and observe the baseline and feature model. Convert a predicted MW value into MWh, then carry it into lesson 18’s settlement model to connect forecasting with financial exposure."
        }
      }
    ],
    "lab": "forecast",
    "workedExample": {
      "title": {
        "zh": "把一个负荷预测变成结算电量",
        "en": "Turn a demand forecast into energy"
      },
      "body": {
        "zh": "设教学线性模型为 $\\hat D=80+1.5(T-20)+10I$ MW，其中 $T$ 是发布时可用的次日温度预报，$I=1$ 表示计划生产。若 $T=28$，则 $\\hat D=80+12+10=102$ MW。在一个 15 分钟区间，对应 $102\\times0.25=25.5$ MWh。\n\n另一个独立的系统例子：需求 120 MW、风电 25 MW、光伏 15 MW，则净负荷为 $120-25-15=80$ MW，区间电量为 20 MWh。两个例子的统计边界不同，不能把工厂的 25.5 MWh 与系统的 20 MWh 相减。",
        "en": "Consider a teaching model $\\hat D=80+1.5(T-20)+10I$ MW, where $T$ is tomorrow’s temperature forecast available at issuance and $I=1$ indicates scheduled production. At $T=28$, demand is $80+12+10=102$ MW. A 15-minute interval contains $102\\times0.25=25.5$ MWh.\n\nIn a separate system example, demand of 120 MW, wind of 25 MW, and solar of 15 MW give net load of $120-25-15=80$ MW, or 20 MWh over the interval. These examples refer to different system boundaries: subtracting the factory’s 25.5 MWh from the system’s 20 MWh would be meaningless."
      }
    },
    "misconception": {
      "zh": "未来时段的特征并不都不可用：日历和已经公布的生产计划通常可用；未来实际气温则不可用，要换成当时发布的天气预报。区分的是信息发布时间。",
      "en": "Not every future-dated feature is unavailable. Calendars and already released production plans may be known; realized future temperature is not. Use the weather forecast available at issuance. The distinction is information release time."
    },
    "boundary": {
      "zh": "本章和实验使用教学合成数据，未接入安徽负荷、气象或交易接口；简化净负荷不含损耗和完整电网调度。模型优劣必须在实际目标与时间窗口上重新验证。",
      "en": "The lesson and experiment use synthetic data and no Anhui metering, weather, or trading feed. The simplified net-load definition omits losses and full dispatch. Model rankings must be validated for the actual target and time window."
    },
    "quiz": {
      "question": {
        "zh": "每天10:00预测明天负荷，哪个输入最符合可用信息原则？",
        "en": "Which input is valid for a 10:00 forecast of tomorrow’s demand?"
      },
      "options": [
        {
          "text": {
            "zh": "明天最终观测到的最高气温",
            "en": "Tomorrow’s final measured maximum temperature"
          },
          "explanation": {
            "zh": "该值要等明天之后才知道，提前使用会产生数据泄露。",
            "en": "This observation becomes known later; using it at issuance leaks future information."
          },
          "correct": false
        },
        {
          "text": {
            "zh": "今天09:00发布的明天天气预报",
            "en": "Tomorrow’s weather forecast released at 09:00 today"
          },
          "explanation": {
            "zh": "它在10:00发布预测时已经可用，应保留预报的原始版本与时间戳。",
            "en": "It is available at 10:00. Preserve the original forecast vintage and timestamp."
          },
          "correct": true
        },
        {
          "text": {
            "zh": "在全部历史和测试数据上计算的标准化均值",
            "en": "A scaling mean fitted on all training and test data"
          },
          "explanation": {
            "zh": "测试期信息参与了预处理，应只在当时的训练集上拟合。",
            "en": "The preprocessing has learned from the test period. Fit it on the available training set only."
          },
          "correct": false
        }
      ]
    },
    "sourceIds": [
      "fpp3",
      "d2l",
      "sklearn-leakage"
    ]
  },
  {
    "id": "14",
    "moduleId": "forecasting",
    "title": {
      "zh": "电价预测：尖峰、负价与市场状态",
      "en": "Price forecasting: spikes, negative prices, and regimes"
    },
    "subtitle": {
      "zh": "价格由供需和约束共同形成，不只是负荷曲线换一个单位。",
      "en": "Prices reflect supply, demand, and constraints—not demand in different units."
    },
    "minutes": 22,
    "prerequisites": [
      "11",
      "12",
      "13"
    ],
    "objectives": {
      "zh": [
        "解释电价为何可能出现突变。",
        "选择与市场和发布时刻一致的价格目标。",
        "在负价和尖峰下合理比较预测指标。"
      ],
      "en": [
        "Explain why prices can change abruptly.",
        "Choose a price target consistent with the market and issue time.",
        "Evaluate forecasts sensibly around negative prices and spikes."
      ]
    },
    "tags": {
      "zh": [
        "电价预测",
        "尖峰",
        "负电价",
        "基线"
      ],
      "en": [
        "price forecasting",
        "spikes",
        "negative prices",
        "baselines"
      ]
    },
    "figure": "forecasting",
    "figureCaption": {
      "zh": "同样的需求变化，可能对应不同的价格未来",
      "en": "The same demand change may produce different price outcomes"
    },
    "figureNotes": {
      "zh": [
        "历史记录只说明过去的供需和规则状态。",
        "天气与生产会影响负荷，也会改变新能源出力。",
        "多条未来路径提示尖峰、低价和普通状态需要分别考虑。"
      ],
      "en": [
        "History reflects past supply, demand, and market conditions.",
        "Weather and production affect both consumption and renewable output.",
        "Different future paths represent ordinary, low-price, and stressed states."
      ]
    },
    "sections": [
      {
        "id": "mechanism",
        "title": {
          "zh": "为什么负荷平滑，电价却会跳变？",
          "en": "Why can smooth demand produce a price jump?"
        },
        "body": {
          "zh": "在第 11 课的教学市场中，供给由不同报价的阶梯组成。需求仍落在同一阶梯时，增加一点需求可能不改变价格；一旦跨过下一台资源的进入门槛，边际报价就会改变。输电约束、机组不可用、备用需求和预测误差还会改变哪些资源真正可用。\n\n因此，不能把电价建模为“负荷越大价格必然按固定比例增加”。负荷相同，风光出力、燃料条件或可用输电容量不同，也可能有不同电价。建立价格模型时，先写出形成价格的机制和你能观测到的代理变量，再选择统计模型或神经网络。",
          "en": "In lesson 11’s teaching market, supply consists of offer steps. A small demand increase within the same step may leave the price unchanged. Crossing the threshold for another resource changes the marginal offer. Transmission limits, outages, reserve requirements, and forecast errors can further alter which supply is usable.\n\nPrice therefore is not simply demand multiplied by a fixed coefficient. The same demand can yield different prices when renewable output, fuel conditions, or available transfer capacity differs. Before choosing a statistical or neural model, describe the price-formation mechanism and the observable variables that approximate it."
        }
      },
      {
        "id": "target",
        "title": {
          "zh": "先选准你要预测的那一种价格",
          "en": "Identify the price you actually need"
        },
        "body": {
          "zh": "日前价格、实时价格、节点价格、分区价格、统一结算点价格和零售合同价格不是同一个标签。一个模型即使准确预测系统平均价格，也未必能覆盖某个结算节点的价差风险。数据表必须说明币种、元/MWh 或元/kWh、时间粒度、价格所在地点以及是否已经被修订。\n\n基线可以从发布时已可获得的历史同刻价格开始，例如上周同刻，再加入已知日历、滞后价格、负荷与风光预测、可获得的检修或网络信息。若实时报价前已经公布了日前价，它可能是可用特征；但不能倒过来用事后实时价预测更早的日前价格。模型的输入集合由业务时序决定。",
          "en": "Day-ahead, real-time, nodal, zonal, settlement-point, and retail contract prices are different targets. An accurate system-average forecast may not cover the spread at a participant’s settlement location. Record currency, CNY/MWh or CNY/kWh, interval, location, and revision status.\n\nStart with a same-slot historical price already published at issuance, such as the same slot last week, then add calendars, lagged prices, demand and renewable forecasts, and available outage or network information. A published day-ahead price may be available for a later real-time decision. A realized real-time price cannot be used to forecast an earlier day-ahead outcome. The business timeline defines the valid input set."
        }
      },
      {
        "id": "metrics",
        "title": {
          "zh": "用合适的尺子衡量尖峰与负价",
          "en": "Evaluate spikes and negative prices carefully"
        },
        "body": {
          "zh": "MAE 让每个误差按绝对大小贡献；RMSE 更强调大误差，适合揭示少数尖峰是否被严重漏判。二者都不能独自证明交易价值：应按高价时段、普通时段、负价时段以及不同季节分组评估，并报告价格分位数或区间的质量。\n\n当真实价格接近零或为负时，直接用 $|y-\\hat y|/|y|$ 作为百分比误差会出现除零或极大权重。不要因某个指标常见就忽略它的分母。可报告原单位的 MAE/RMSE、分位数损失，以及用同一结算模型计算的采购成本；每个指标都要说明它衡量的问题。",
          "en": "MAE weights errors by absolute size; RMSE emphasizes large misses and can reveal failures around spikes. Neither proves trading value alone. Break results down into high-price, ordinary, and negative-price intervals, seasons, and relevant regimes; also assess quantiles or intervals.\n\nA percentage error based on $|y-\\hat y|/|y|$ becomes undefined at zero and unstable near it. Negative and near-zero prices make denominator choice especially important. Report errors in the original price unit, quantile losses, and procurement costs under a consistent settlement model. Explain the distinct question each metric answers."
        }
      },
      {
        "id": "regimes",
        "title": {
          "zh": "制度和市场状态会改变数据分布",
          "en": "Rules and operating regimes can shift the distribution"
        },
        "body": {
          "zh": "历史上学到的价格关系可能随新能源渗透、燃料条件、申报机制或市场边界变化。训练集不是一份永远有效的“市场规律”。用滚动回测检查近期表现，给重要规则变化和异常运行事件打标签，并记录模型在哪个时间范围、哪套规则下被验证。\n\n负价在允许相应价格边界的市场中可能出现，但不是所有地区、所有产品都允许负报价或负成交价。本教程实验允许负数是为了展示数学机制，不声明安徽当前价格上下限。具体申报上下限、市场干预和结算口径必须查阅适用的正式规则。",
          "en": "Relationships learned from history can shift with renewable penetration, fuel conditions, bidding arrangements, and market boundaries. A training set is not an eternal law of the market. Use rolling evaluation, label relevant rule changes and abnormal events, and record the period and rules under which the model was validated.\n\nNegative prices can arise where market bounds permit them; they are not allowed for every product or region. Negative inputs in the experiment illustrate the mathematics and do not assert current Anhui price limits. Check applicable formal rules for bidding bounds, interventions, and settlement definitions."
        }
      }
    ],
    "lab": "forecast",
    "workedExample": {
      "title": {
        "zh": "增加2 MW，为什么边际价格会改变？",
        "en": "Why can two additional MW change the marginal price?"
      },
      "body": {
        "zh": "采用单区域、无网络约束的教学报价表：40 MW 报 100 元/MWh，60 MW 报 300 元/MWh，30 MW 报 900 元/MWh。需求为 99 MW 时，调用 40+59 MW，边际报价为 300 元/MWh；需求为 101 MW 时，调用 40+60+1 MW，边际报价为 900 元/MWh。\n\n这不是价格预测模型，而是形成机制的算例。需求只增加 2 MW，价格却改变 600 元/MWh。若数据中很少出现这种门槛，平均拟合很好也可能遗漏尖峰；需要单独检查尾部表现。",
        "en": "Use a single-zone, unconstrained teaching offer stack: 40 MW at 100 CNY/MWh, 60 MW at 300, and 30 MW at 900. Demand of 99 MW dispatches 40+59 MW, so the marginal offer is 300 CNY/MWh. Demand of 101 MW dispatches 40+60+1 MW, making the marginal offer 900 CNY/MWh.\n\nThis is a mechanism example, not a forecasting model. A 2 MW demand increase changes the price by 600 CNY/MWh. If such thresholds rarely appear in training, a good average fit may still miss spikes. Inspect tail behavior separately."
      }
    },
    "misconception": {
      "zh": "预测价格与预测利润不是同一件事。利润还依赖成交电量、结算地点、合同、实际用量、风险约束和各类费用；单独展示价格准确率不足以评价交易策略。",
      "en": "Forecasting price is different from forecasting profit. Outcomes also depend on cleared quantities, settlement location, contracts, actual use, risk limits, and fees. Price accuracy alone does not evaluate a trading strategy."
    },
    "boundary": {
      "zh": "本章解释一般价格机制和评估方法，不提供市场价格预测服务。报价数字、负价范围和曲线均为教学设置，不代表安徽或其他市场的实际价格边界。",
      "en": "The lesson explains mechanisms and evaluation, not a live price forecast. Offers, negative-price ranges, and curves are teaching choices rather than actual price limits for Anhui or another market."
    },
    "quiz": {
      "question": {
        "zh": "某时段真实电价为0，最需要避免什么？",
        "en": "What requires special care when the actual price is zero?"
      },
      "options": [
        {
          "text": {
            "zh": "不加处理地用该价格作MAPE分母",
            "en": "Using that price directly as a MAPE denominator"
          },
          "explanation": {
            "zh": "分母为零会使百分比误差无定义；应选用原单位误差等合适指标。",
            "en": "Division by zero makes the percentage error undefined. Use suitable measures such as errors in the original unit."
          },
          "correct": true
        },
        {
          "text": {
            "zh": "记录该时段的绝对误差",
            "en": "Recording the absolute error in that interval"
          },
          "explanation": {
            "zh": "绝对误差仍有定义；真正的问题是百分比指标的分母。",
            "en": "Absolute error remains well-defined; the denominator is the problem."
          },
          "correct": false
        },
        {
          "text": {
            "zh": "检查价格所在的结算地点",
            "en": "Checking the settlement location"
          },
          "explanation": {
            "zh": "地点是必要的标签信息，检查它不会引入除零问题。",
            "en": "Location is essential target metadata and does not create a division-by-zero problem."
          },
          "correct": false
        }
      ]
    },
    "sourceIds": [
      "fpp3",
      "pjm-lmp",
      "cn-spot-2023"
    ]
  },
  {
    "id": "15",
    "moduleId": "forecasting",
    "title": {
      "zh": "按时间回测，识别数据泄露",
      "en": "Backtesting in time and detecting leakage"
    },
    "subtitle": {
      "zh": "模拟“当时能做出的预测”，而不是事后解释全部数据。",
      "en": "Recreate forecasts that could have been issued at the time."
    },
    "minutes": 24,
    "prerequisites": [
      "07",
      "13",
      "14"
    ],
    "objectives": {
      "zh": [
        "建立训练、验证、测试的时间边界。",
        "识别预处理、天气、窗口和调参中的泄露。",
        "用相同发布时刻比较误差与业务成本。"
      ],
      "en": [
        "Set chronological training, validation, and test boundaries.",
        "Detect leakage in preprocessing, weather, windows, and tuning.",
        "Compare errors and business cost at consistent issue times."
      ]
    },
    "tags": {
      "zh": [
        "滚动回测",
        "数据泄露",
        "MAE",
        "时间切分"
      ],
      "en": [
        "rolling backtest",
        "data leakage",
        "MAE",
        "time split"
      ]
    },
    "figure": "forecasting",
    "figureCaption": {
      "zh": "每次预测，都站在当时的信息边界上",
      "en": "Each forecast stands at its own information boundary"
    },
    "figureNotes": {
      "zh": [
        "历史记录能够进入模型；未来目标暂时不可见。",
        "分界线要随回测发布时刻向前移动。",
        "预测完成后才能揭示真实结果，并把它用于下一次允许的更新。"
      ],
      "en": [
        "Historical information may enter the model; future targets are hidden.",
        "The information boundary advances with each forecast issue time.",
        "Reveal actual outcomes after forecasting and use them only in later permitted updates."
      ]
    },
    "sections": [
      {
        "id": "split",
        "title": {
          "zh": "为什么随机打散常常不合适？",
          "en": "Why is shuffling often inappropriate?"
        },
        "body": {
          "zh": "普通随机切分会让训练样本来自测试样本的未来。对具有趋势、季节性和规则变化的电力时间序列，这与真实部署不一致。先把较早数据用于训练，中间一段用于验证和选择超参数，最后保留从未参与选择的测试期。测试期不能每调一次参数就拿来“再看看”。\n\n训练窗口可以不断扩展，也可以仅保留最近固定长度；二者分别偏向利用更多历史和适应近期变化。选择本身也应通过历史验证。特别注意：一个训练样本的输入虽然在过去，它的预测目标可能跨入测试区间，仍需根据标签实际可用时间排除或设置间隔。",
          "en": "Random splitting can place observations from the test period’s future into training. That does not reproduce deployment for electricity time series with trends, seasonality, and rule changes. Use an earlier period for training, a later one for model selection, and a final untouched test period. Repeatedly inspecting that final period while tuning makes it part of model selection.\n\nAn expanding window uses more history; a fixed rolling window emphasizes recent conditions. Validate that choice historically. Also inspect target availability: a sample’s inputs may be in the past while its prediction label reaches into the test interval. Exclude such samples or introduce a suitable gap."
        }
      },
      {
        "id": "vintages",
        "title": {
          "zh": "泄露通常藏在看似无害的数据准备里",
          "en": "Leakage hides in ordinary preparation"
        },
        "body": {
          "zh": "常见泄露包括：先用全量数据求均值方差再切分；用中心滚动平均作为滞后特征；用最终修订的天气或计量数据代替当时版本；把事后可见的出清结果加入申报前特征；在全部数据上挑选最相关的变量。代码没有读取“未来目标列”，并不等于没有未来信息。\n\n给每个数据字段保存观测时间、发布时间和修订版本。回测取数使用“截至当时”的连接规则。缺失值填补、归一化和特征筛选都在每个训练窗口内拟合，再应用于验证窗口。数据管道与预测模型应该作为一个整体进入回测。",
          "en": "Leakage includes scaling before splitting, centered rolling features, final weather or meter revisions substituted for historical vintages, post-clearing outcomes used before submission, and selecting features using the full dataset. Avoiding an explicit future-target column is not enough.\n\nTrack observation time, publication time, and revision version for each field. Use as-of joins during backtesting. Fit imputers, scalers, and feature selectors within each training window, then apply them to its evaluation window. Backtest the entire data pipeline together with the predictor."
        }
      },
      {
        "id": "rolling",
        "title": {
          "zh": "一次滚动回测具体做什么？",
          "en": "What happens at each backtest origin?"
        },
        "body": {
          "zh": "在第一个发布时刻冻结所有可用信息，拟合或加载当时版本的模型，预测未来指定区间，并保存预测结果。等目标真实值按业务规则可用后，计算误差。再移动发布时刻，按原定更新频率重复。不能为了提高某一窗口的表现，临时增加现实中不会发生的重训次数。\n\n本章实验逐点揭示合成序列，比较只用过去数据的预测与提前使用包括未来目标在内的全部序列拟合的泄露反例。反例能够得到异常漂亮的分数，恰好说明分数需要通过信息边界来解释。实验演示泄露原理，不声称所有泄露都会使误差变成零。",
          "en": "Freeze the available information at the first issue time. Fit or load the model version that could exist then, predict the specified horizon, and store the forecast. Score it when the target becomes available under the business process. Move the issue time forward and repeat using the planned retraining schedule. Do not add retraining opportunistically in windows where it improves the score.\n\nThe experiment reveals a synthetic series point by point. It contrasts past-only forecasting with a deliberately leaked model fitted on the entire sequence, including future targets. The latter’s impressive score exposes why an information boundary matters. This example does not imply every form of leakage produces zero error."
        }
      },
      {
        "id": "assessment",
        "title": {
          "zh": "把误差、成本与可重复性一起保存",
          "en": "Keep errors, costs, and reproducibility together"
        },
        "body": {
          "zh": "对功率序列，$\\mathrm{MAE}=n^{-1}\\sum|y_i-\\hat y_i|$ 的单位仍是 MW；$\\mathrm{RMSE}=\\sqrt{n^{-1}\\sum(y_i-\\hat y_i)^2}$ 也为 MW。若采用 WAPE，要写明分母为测试期实际量绝对值之和，分母为零时不定义。比较价格模型时，不要把不同地点、分辨率或币种混在同一平均值中。\n\n业务评估还应在相同合同、价格、可交易集合和约束下计算成本，并单列约束违例。保存数据快照、模型参数、版本、随机种子、测试窗口和指标口径。实验可重复只是必要条件；是否代表真实部署，还取决于信息、费用、市场规则与操作约束是否被正确模拟。",
          "en": "For power forecasts, $\\mathrm{MAE}=n^{-1}\\sum|y_i-\\hat y_i|$ and $\\mathrm{RMSE}=\\sqrt{n^{-1}\\sum(y_i-\\hat y_i)^2}$ both retain units of MW. If using WAPE, define its denominator as the sum of absolute actual values and handle a zero denominator explicitly. Do not average incompatible price locations, resolutions, or currencies.\n\nEvaluate business cost under identical contracts, prices, permitted actions, and constraints, and report constraint violations separately. Preserve data snapshots, parameters, versions, seeds, windows, and metric definitions. Reproducibility is necessary, but realistic deployment evaluation also needs correct information timing, fees, market rules, and operating limits."
        }
      }
    ],
    "lab": "backtest",
    "workedExample": {
      "title": {
        "zh": "同一组预测，三种误差口径",
        "en": "Three metrics for the same forecasts"
      },
      "body": {
        "zh": "四个等长区间的真实功率为 $[100,110,90,120]$ MW，预测为 $[105,100,95,110]$ MW。绝对误差为 $[5,10,5,10]$ MW。\n\n$$\\mathrm{MAE}=30/4=7.5\\ \\mathrm{MW},\\qquad \\mathrm{RMSE}=\\sqrt{250/4}\\approx7.91\\ \\mathrm{MW}.$$\n\n按本例定义，$\\mathrm{WAPE}=30/(100+110+90+120)\\approx7.14\\%$。这三个数来自同一组观测，衡量角度不同。它们没有包含电价，因此不能直接推出采购成本差多少。",
        "en": "Actual power in four equally sized intervals is $[100,110,90,120]$ MW; forecasts are $[105,100,95,110]$ MW. Absolute errors are $[5,10,5,10]$ MW.\n\n$$\\mathrm{MAE}=30/4=7.5\\ \\mathrm{MW},\\qquad \\mathrm{RMSE}=\\sqrt{250/4}\\approx7.91\\ \\mathrm{MW}.$$\n\nWith the stated definition, $\\mathrm{WAPE}=30/(100+110+90+120)\\approx7.14\\%$. These describe the same forecasts from different angles. None includes prices, so none directly determines the procurement-cost difference."
      }
    },
    "misconception": {
      "zh": "按时间分割CSV只解决一部分问题。若标准化、特征选择或天气数据版本已经使用未来信息，文件顺序正确也会泄露。必须审查整条数据处理链。",
      "en": "Chronologically splitting a CSV solves only part of the problem. Scaling, feature selection, or weather vintages may already contain future information. Review the whole data pipeline."
    },
    "boundary": {
      "zh": "实验使用小型确定性合成序列，泄露对照故意用含未来目标的全序列拟合。它不是工业模型性能排行；真实评估还要考虑发布延迟、跨期标签、数据修订、季节迁移和规则变化。",
      "en": "The experiment uses a small deterministic synthetic series and an intentionally invalid fit using future targets. It is not an industrial model benchmark. Real evaluation must handle delays, overlapping labels, revisions, seasonality, and rule changes."
    },
    "quiz": {
      "question": {
        "zh": "哪种流程仍然存在泄露？",
        "en": "Which workflow still leaks information?"
      },
      "options": [
        {
          "text": {
            "zh": "每个训练窗口内单独拟合标准化器",
            "en": "Fitting a scaler separately inside each training window"
          },
          "explanation": {
            "zh": "这是正确做法，前提是训练窗口中的标签与特征也已经可用。",
            "en": "This is appropriate, provided the window’s features and labels are actually available."
          },
          "correct": false
        },
        {
          "text": {
            "zh": "先按时间切分，再用全部数据的均值标准化",
            "en": "Splitting chronologically, then scaling with the full-data mean"
          },
          "explanation": {
            "zh": "预处理看到了测试期信息；切分顺序没有挽救全量拟合。",
            "en": "Preprocessing has learned from the test period. Chronological ordering does not fix full-data fitting."
          },
          "correct": true
        },
        {
          "text": {
            "zh": "只在验证期选择超参数，最终测试一次",
            "en": "Selecting hyperparameters on validation data and testing once"
          },
          "explanation": {
            "zh": "这保留了独立测试集，仍应保证所有前处理也在训练范围内。",
            "en": "This preserves an independent test set, assuming preprocessing also respects the training boundary."
          },
          "correct": false
        }
      ]
    },
    "sourceIds": [
      "fpp3",
      "sklearn-leakage",
      "sklearn-timeseries"
    ]
  },
  {
    "id": "16",
    "moduleId": "forecasting",
    "title": {
      "zh": "分位数、情景与不确定性",
      "en": "Quantiles, scenarios, and uncertainty"
    },
    "subtitle": {
      "zh": "从一个“最可能”的数，走向能够支撑风险决策的分布。",
      "en": "Move from a single estimate to a distribution that supports risk decisions."
    },
    "minutes": 24,
    "prerequisites": [
      "03",
      "13",
      "14",
      "15"
    ],
    "objectives": {
      "zh": [
        "区分均值、中位数、分位数和区间。",
        "计算pinball loss并解释不对称惩罚。",
        "保留情景内的时序和变量相关关系。"
      ],
      "en": [
        "Distinguish means, medians, quantiles, and intervals.",
        "Calculate pinball loss and explain its asymmetric penalty.",
        "Preserve temporal and cross-variable dependence in scenarios."
      ]
    },
    "tags": {
      "zh": [
        "分位数",
        "pinball loss",
        "概率预测",
        "情景"
      ],
      "en": [
        "quantiles",
        "pinball loss",
        "probabilistic forecasts",
        "scenarios"
      ]
    },
    "figure": "forecasting",
    "figureCaption": {
      "zh": "未来是一组带概率的可能性",
      "en": "The future is a set of possibilities with probabilities"
    },
    "figureNotes": {
      "zh": [
        "历史数据为分布估计提供证据，但不能保证未来复制过去。",
        "同一个发布时刻可以给出多个分位数或完整情景。",
        "一条情景应同时描述相关时段和变量，避免拼成物理上不协调的未来。"
      ],
      "en": [
        "History informs a distribution without guaranteeing that it repeats.",
        "One issue time can produce multiple quantiles or complete scenarios.",
        "A scenario should describe related times and variables coherently."
      ]
    },
    "sections": [
      {
        "id": "quantile",
        "title": {
          "zh": "均值不是“最保险的预测”",
          "en": "A mean is not automatically a safe forecast"
        },
        "body": {
          "zh": "均值最小化期望平方误差，中位数最小化期望绝对误差；不同损失对应不同“最好”的点预测。分位数 $q_\\tau$ 可定义为满足 $F(q)\\ge\\tau$ 的最小值，$\\tau$ 越高，越偏向分布的较大一侧。80%分位数表达分布位置，不表示模型有80%的确定性，更不保证每一天都达到相同覆盖率。\n\n离散分布会有跳跃，所以“恰好80%的值在以下”未必成立。读区间时也要区别边际覆盖和联合覆盖：每天96个时段各有80%覆盖，并不等于整条96点曲线有80%概率全部落在区间中。",
          "en": "The mean minimizes expected squared error; a median minimizes expected absolute error. Different losses therefore define different best point predictions. A quantile $q_\\tau$ can be defined as the smallest value satisfying $F(q)\\ge\\tau$. Higher quantiles lie toward the upper side of the distribution. An 80th percentile is not “80% model certainty,” nor a guarantee of coverage every day.\n\nDiscrete distributions jump, so exactly 80% of observations need not lie below an 80th-percentile estimate. Distinguish marginal and joint coverage: 80% coverage for each of 96 daily intervals does not imply an 80% probability that all 96 outcomes fall inside their respective intervals."
        }
      },
      {
        "id": "pinball",
        "title": {
          "zh": "为什么分位数损失是不对称的？",
          "en": "Why is quantile loss asymmetric?"
        },
        "body": {
          "zh": "令误差 $u=y-q$。分位数损失为 $\\rho_\\tau(u)=\\max(\\tau u,(\\tau-1)u)$。实际值高于预测时，损失是 $\\tau(y-q)$；实际值低于预测时，损失是 $(1-\\tau)(q-y)$。当 $\\tau=0.8$ 时，相同幅度的低估惩罚是高估的四倍。\n\n这种不对称能把模型推向相应的条件分位数，而不是仅仅提高所有预测。若要把分位数用于采购，还需要由少买和多买的业务代价推导目标水平，不能想当然地认为“越高越安全”。交互实验允许改变 $\\tau$ 和候选预测，直接查看损失如何变化。",
          "en": "Let $u=y-q$. Pinball loss is $\\rho_\\tau(u)=\\max(\\tau u,(\\tau-1)u)$. If the observation exceeds the prediction, the penalty is $\\tau(y-q)$; if it falls below, it is $(1-\\tau)(q-y)$. At $\\tau=0.8$, an underprediction has four times the penalty of an equally sized overprediction.\n\nThis asymmetry targets a conditional quantile rather than simply increasing every forecast. Choosing a quantile for procurement still requires a model of under- and over-purchasing costs; a higher value is not automatically safer. Change $\\tau$ and the candidate prediction in the experiment to inspect the resulting loss."
        }
      },
      {
        "id": "calibration",
        "title": {
          "zh": "覆盖率与区间宽度一起看",
          "en": "Assess coverage together with interval width"
        },
        "body": {
          "zh": "一个极宽区间很容易覆盖真实值，却可能几乎不能帮助决策。一个很窄的区间如果经常漏掉真实值，也会给人错误信心。评估时同时报告区间覆盖率、平均宽度、分位数损失，并按高温、节假日、尖峰等条件检查校准；只看全测试期平均覆盖可能掩盖某类工况失效。\n\n例如目标80%区间在100个留出时段中覆盖81次，只能描述该样本的经验覆盖，不能证明未来必然覆盖80%。时间相关还会减少有效独立样本数。模型更新和市场制度改变后，要持续检查概率输出，而不是把一次校准结果永久沿用。",
          "en": "An extremely wide interval can cover observations while providing little decision value. A narrow interval that often misses gives false confidence. Report coverage, width, and quantile loss together, and inspect calibration under heat, holidays, and price spikes. Average coverage may hide failure in an important operating regime.\n\nIf an intended 80% interval covers 81 of 100 held-out periods, that describes empirical coverage in that sample; it does not prove future 80% coverage. Temporal dependence also reduces the effective number of independent observations. Recheck probability outputs after model updates and market changes."
        }
      },
      {
        "id": "scenarios",
        "title": {
          "zh": "从单点分布到整条情景",
          "en": "From individual distributions to complete scenarios"
        },
        "body": {
          "zh": "储能和中长期采购不能只看某一个时段的随机数。把各时段的分位数独立拼接，可能得到上下跳变不合理的负荷，或同时出现高光伏和不合理天气组合。一个场景应是一组共同发生的量：负荷轨迹、风光轨迹、电价轨迹以及权重 $p_s$，且权重非负、总和为1。\n\n实际方法可从历史残差块、联合统计模型或校准后的生成模型建立场景；本教程先使用少量显式情景，便于手算和检查。下一阶段会计算每个决策在每个情景下的成本，再对期望与尾部进行比较。场景代表假设空间，并不覆盖所有极端事件。",
          "en": "Storage and procurement depend on trajectories, not isolated random values. Independently stitching interval quantiles together can create implausible load jumps or inconsistent weather and solar outcomes. A scenario is a jointly occurring set of demand, renewable, and price trajectories with nonnegative weight $p_s$, summing to one.\n\nPossible methods include historical residual blocks, joint statistical models, and calibrated generative models. The course begins with a few explicit scenarios so calculations remain inspectable. The next stage evaluates each decision in each scenario and compares expected and tail costs. A scenario set describes assumptions and cannot cover every extreme event."
        }
      }
    ],
    "lab": "quantiles",
    "workedExample": {
      "title": {
        "zh": "亲手计算80%分位数与pinball loss",
        "en": "Compute an 80th percentile and its pinball loss"
      },
      "body": {
        "zh": "教学价格样本为 $[100,200,300,500,900]$ 元/MWh，等权重。均值为400，中位数为300。采用经验CDF的下分位定义，$q_{0.8}=500$。\n\n当 $\\tau=0.8$、候选 $q=500$ 时，五个样本的损失为 $[80,60,40,0,320]$，平均为100 元/MWh。对于 $y=900$ 的低估，损失为 $0.8(900-500)=320$；对于 $y=100$ 的高估，为 $0.2(500-100)=80$。\n\n离散样本中最优点可能不唯一：本例从500到900之间的预测均有相同平均损失。本课报告500是分位数选择约定，不声称它是唯一优化解。",
        "en": "Use equally weighted teaching price samples $[100,200,300,500,900]$ CNY/MWh. Their mean is 400 and median is 300. With the lower empirical-CDF convention, $q_{0.8}=500$.\n\nAt $\\tau=0.8$ and candidate $q=500$, losses are $[80,60,40,0,320]$, averaging 100 CNY/MWh. Underpredicting $y=900$ costs $0.8(900-500)=320$; overpredicting $y=100$ costs $0.2(500-100)=80$.\n\nA discrete sample need not have a unique optimum: candidates between 500 and 900 have the same mean loss here. Reporting 500 follows the quantile convention rather than claiming a unique optimizer."
      }
    },
    "misconception": {
      "zh": "预测区间不是对未来的保证，分位数也不是主观的“信心百分比”。必须说明条件信息、目标变量、经验覆盖和验证区间；交易风险还与变量相关性有关。",
      "en": "A prediction interval is not a guarantee, and a quantile is not a subjective confidence percentage. Specify the conditioning information, target, empirical coverage, and validation period. Trading risk also depends on dependence between variables."
    },
    "boundary": {
      "zh": "实验用少量等权离散样本解释分位数损失，不拟合真实概率预测器，也不提供安徽价格分布。真实情景需要校准、相关结构和极端事件检查。",
      "en": "The experiment explains quantile loss using a small equally weighted discrete sample. It fits no live probability model and estimates no Anhui price distribution. Real scenarios need calibration, dependence modeling, and stress testing."
    },
    "quiz": {
      "question": {
        "zh": "在τ=0.8时，低估10与高估10的损失分别是多少？",
        "en": "At τ=0.8, what are the losses for underpredicting by 10 and overpredicting by 10?"
      },
      "options": [
        {
          "text": {
            "zh": "8和2",
            "en": "8 and 2"
          },
          "explanation": {
            "zh": "低估损失为0.8×10=8，高估损失为(1−0.8)×10=2。",
            "en": "Underprediction costs 0.8×10=8; overprediction costs (1−0.8)×10=2."
          },
          "correct": true
        },
        {
          "text": {
            "zh": "2和8",
            "en": "2 and 8"
          },
          "explanation": {
            "zh": "这把高低估惩罚颠倒了；高分位数损失对低估更敏感。",
            "en": "This reverses the penalties. A high-quantile loss penalizes underprediction more."
          },
          "correct": false
        },
        {
          "text": {
            "zh": "都是10",
            "en": "10 and 10"
          },
          "explanation": {
            "zh": "那是绝对误差；pinball loss按目标分位数给两侧不同权重。",
            "en": "That is absolute error. Pinball loss assigns different weights according to the target quantile."
          },
          "correct": false
        }
      ]
    },
    "sourceIds": [
      "pinball",
      "fpp3",
      "cvar"
    ]
  }
];
