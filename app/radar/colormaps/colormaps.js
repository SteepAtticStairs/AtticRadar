const colortable_parser = require('./colortable_parser');

const range_folded = 'rgb(139, 0, 218)';
const range_folded_val = 999;

const reflectivity = 
`product: BR
units: dBZ
step: 5

color4: -30 116 78 173 0 147 141 117 255
color: -20 150 145 83 210 212 180
color: -10 204 207 180 65 91 158
color: 10 67 97 162 106 208 228
color: 18 111 214 232 53 213 91
color: 22 17 213 24 9 94 9
color: 35 29 104 9 234 210 4
color: 40 255 226 0 255 128 0
color: 50 255 0 0 113 0 0
color: 60 255 255 255 255 146 255
color: 65 255 117 255 225 11 227
color: 70 178 0 255 99 0 214
color: 75 5 236 240 1 32 32
color: 85 1 32 32
color: 95 1 32 32`
const reflectivity_radarscope = 
`Product: BR
Units:   DBZ
Step:    5
SolidColor:	-32.0		115	77	172
SolidColor:	-31.5		115	78	168
SolidColor:	-31.0		115	79	165
SolidColor:	-30.5		115	81	162
SolidColor:	-30.0		116	82	158
SolidColor:	-29.5		116	84	155
SolidColor:	-29.0		116	85	152
SolidColor:	-28.5		117	86	148
SolidColor:	-28.0		117	88	145
SolidColor:	-27.5		117	89	142
SolidColor:	-27.0		118	91	138
SolidColor:	-26.5		118	92	135
SolidColor:	-26.0		118	94	132
SolidColor:	-25.5		119	95	128
SolidColor:	-25.0		119	96	125
SolidColor:	-24.5		119	98	122
SolidColor:	-24.0		120	99	118
SolidColor:	-23.5		120	101	115
SolidColor:	-23.0		120	102	112
SolidColor:	-22.5		121	103	108
SolidColor:	-22.0		121	105	105
SolidColor:	-21.5		121	106	102
SolidColor:	-21.0		122	108	98
SolidColor:	-20.5		122	109	95
SolidColor:	-20.0		122	111	92
SolidColor:	-19.5		123	112	88
SolidColor:	-19.0		123	113	85
SolidColor:	-18.5		123	115	82
SolidColor:	-18.0		124	116	78
SolidColor:	-17.5		124	118	75
SolidColor:	-17.0		124	119	72
SolidColor:	-16.5		125	121	69
SolidColor:	-16.0		127	123	72
SolidColor:	-15.5		129	125	75
SolidColor:	-15.0		131	127	79
SolidColor:	-14.5		133	130	82
SolidColor:	-14.0		135	132	85
SolidColor:	-13.5		137	134	89
SolidColor:	-13.0		139	137	92
SolidColor:	-12.5		141	139	96
SolidColor:	-12.0		144	141	99
SolidColor:	-11.5		146	144	102
SolidColor:	-11.0		148	146	106
SolidColor:	-10.5		150	148	109
SolidColor:	-10.0		152	151	113
SolidColor:	-9.5		154	153	116
SolidColor:	-9.0		156	155	119
SolidColor:	-8.5		158	158	123
SolidColor:	-8.0		161	160	126
SolidColor:	-7.5		163	162	130
SolidColor:	-7.0		165	165	133
SolidColor:	-6.5		167	167	136
SolidColor:	-6.0		169	169	140
SolidColor:	-5.5		171	172	143
SolidColor:	-5.0		173	174	147
SolidColor:	-4.5		175	176	150
SolidColor:	-4.0		178	179	154
SolidColor:	-3.5		173	175	153
SolidColor:	-3.0		168	171	152
SolidColor:	-2.5		163	167	151
SolidColor:	-2.0		158	163	150
SolidColor:	-1.5		154	159	149
SolidColor:	-1.0		149	155	148
SolidColor:	-0.5		144	151	147
SolidColor:	 0.0		139	147	146
SolidColor:	 0.5		135	144	145
SolidColor:	 1.0		130	140	144
SolidColor:	 1.5		125	136	143
SolidColor:	 2.0		120	132	142
SolidColor:	 2.5		115	128	142
SolidColor:	 3.0		111	124	141
SolidColor:	 3.5		106	120	140
SolidColor:	 4.0		101	116	139
SolidColor:	 4.5		96	112	138
SolidColor:	 5.0		92	109	137
SolidColor:	 5.5		87	105	136
SolidColor:	 6.0		82	101	135
SolidColor:	 6.5		77	97	134
SolidColor:	 7.0		73	93	133
SolidColor:	 7.5		68	89	132
SolidColor:	 8.0		63	85	131
SolidColor:	 8.5		58	81	130
SolidColor:	 9.0		54	78	130
SolidColor:	 9.5		55	81	132
SolidColor:	10.0		57	85	134
SolidColor:	10.5		59	89	136
SolidColor:	11.0		61	93	138
SolidColor:	11.5		63	97	141
SolidColor:	12.0		65	101	143
SolidColor:	12.5		67	105	145
SolidColor:	13.0		69	109	147
SolidColor:	13.5		71	113	149
SolidColor:	14.0		73	117	152
SolidColor:	14.5		74	121	154
SolidColor:	15.0		76	125	156
SolidColor:	15.5		78	129	158
SolidColor:	16.0		80	133	160
SolidColor:	16.5		82	137	163
SolidColor:	17.0		84	141	165
SolidColor:	17.5		86	145	167
SolidColor:	18.0		88	149	169
SolidColor:	18.5		90	153	171
SolidColor:	19.0		92	157	174
SolidColor:	19.5		76	165	142
SolidColor:	20.0		60	173	110
SolidColor:	20.5		45	182	78
SolidColor:	21.0		42	175	72
SolidColor:	21.5		39	169	67
SolidColor:	22.0		37	163	62
SolidColor:	22.5		34	156	56
SolidColor:	23.0		31	150	51
SolidColor:	23.5		29	144	46
SolidColor:	24.0		26	137	40
SolidColor:	24.5		24	131	35
SolidColor:	25.0		21	125	30
SolidColor:	25.5		18	118	24
SolidColor:	26.0		16	112	19
SolidColor:	26.5		13	106	14
SolidColor:	27.0		11	100	9
SolidColor:	27.5		35	115	8
SolidColor:	28.0		59	130	7
SolidColor:	28.5		83	145	6
SolidColor:	29.0		107	161	5
SolidColor:	29.5		131	176	4
SolidColor:	30.0		155	191	3
SolidColor:	30.5		179	207	2
SolidColor:	31.0		203	222	1
SolidColor:	31.5		227	237	0
SolidColor:	32.0		252	253	0
SolidColor:	32.5		248	248	0
SolidColor:	33.0		244	243	0
SolidColor:	33.5		241	238	0
SolidColor:	34.0		237	233	0
SolidColor:	34.5		233	228	0
SolidColor:	35.0		230	223	0
SolidColor:	35.5		226	218	0
SolidColor:	36.0		222	213	0
SolidColor:	36.5		219	208	0
SolidColor:	37.0		215	203	0
SolidColor:	37.5		211	198	0
SolidColor:	38.0		208	193	0
SolidColor:	38.5		204	188	0
SolidColor:	39.0		200	183	0
SolidColor:	39.5		197	179	0
SolidColor:	40.0		250	148	0
SolidColor:	40.5		246	144	0
SolidColor:	41.0		242	141	1
SolidColor:	41.5		238	138	1
SolidColor:	42.0		234	135	2
SolidColor:	42.5		231	132	3
SolidColor:	43.0		227	129	3
SolidColor:	43.5		223	126	4
SolidColor:	44.0		219	123	5
SolidColor:	44.5		215	120	5
SolidColor:	45.0		212	116	6
SolidColor:	45.5		208	113	6
SolidColor:	46.0		204	110	7
SolidColor:	46.5		200	107	8
SolidColor:	47.0		196	104	8
SolidColor:	47.5		193	101	9
SolidColor:	48.0		189	98	10
SolidColor:	48.5		185	95	10
SolidColor:	49.0		181	92	11
SolidColor:	49.5		178	89	12
SolidColor:	50.0		249	35	11
SolidColor:	50.5		242	35	12
SolidColor:	51.0		236	35	13
SolidColor:	51.5		230	35	14
SolidColor:	52.0		223	36	15
SolidColor:	52.5		217	36	16
SolidColor:	53.0		211	36	17
SolidColor:	53.5		205	36	18
SolidColor:	54.0		198	37	19
SolidColor:	54.5		192	37	20
SolidColor:	55.0		186	37	22
SolidColor:	55.5		180	37	23
SolidColor:	56.0		173	38	24
SolidColor:	56.5		167	38	25
SolidColor:	57.0		161	38	26
SolidColor:	57.5		155	38	27
SolidColor:	58.0		148	39	28
SolidColor:	58.5		142	39	29
SolidColor:	59.0		136	39	30
SolidColor:	59.5		130	40	32
SolidColor:	60.0		202	153	180
SolidColor:	60.5		201	146	176
SolidColor:	61.0		201	139	173
SolidColor:	61.5		200	133	169
SolidColor:	62.0		200	126	166
SolidColor:	62.5		199	120	162
SolidColor:	63.0		199	113	159
SolidColor:	63.5		199	106	155
SolidColor:	64.0		198	100	152
SolidColor:	64.5		198	93	148
SolidColor:	65.0		197	87	145
SolidColor:	65.5		197	80	141
SolidColor:	66.0		196	74	138
SolidColor:	66.5		196	67	134
SolidColor:	67.0		196	60	131
SolidColor:	67.5		195	54	127
SolidColor:	68.0		195	47	124
SolidColor:	68.5		194	41	120
SolidColor:	69.0		194	34	117
SolidColor:	69.5		194	28	114
SolidColor:	70.0		154	36	224
SolidColor:	70.5		149	34	219
SolidColor:	71.0		144	33	215
SolidColor:	71.5		139	32	210
SolidColor:	72.0		134	31	206
SolidColor:	72.5		129	30	201
SolidColor:	73.0		124	29	197
SolidColor:	73.5		120	28	193
SolidColor:	74.0		115	27	188
SolidColor:	74.5		110	26	184
SolidColor:	75.0		105	24	179
SolidColor:	75.5		100	23	175
SolidColor:	76.0		95	22	170
SolidColor:	76.5		91	21	166
SolidColor:	77.0		86	20	162
SolidColor:	77.5		81	19	157
SolidColor:	78.0		76	18	153
SolidColor:	78.5		71	17	148
SolidColor:	79.0		66	16	144
SolidColor:	79.5		62	15	140
SolidColor:	80.0		132	253	255
SolidColor:	80.5		128	245	249
SolidColor:	81.0		125	238	243
SolidColor:	81.5		121	231	237
SolidColor:	82.0		118	224	231
SolidColor:	82.5		115	217	225
SolidColor:	83.0		111	210	219
SolidColor:	83.5		108	203	213
SolidColor:	84.0		105	196	207
SolidColor:	84.5		101	189	201
SolidColor:	85.0		98	181	196
SolidColor:	85.5		94	174	190
SolidColor:	86.0		91	167	184
SolidColor:	86.5		88	160	178
SolidColor:	87.0		84	153	172
SolidColor:	87.5		81	146	166
SolidColor:	88.0		78	139	160
SolidColor:	88.5		74	132	154
SolidColor:	89.0		71	125	148
SolidColor:	89.5		68	118	143
SolidColor:	90.0		161	101	73
SolidColor:	90.5		155	90	65
SolidColor:	91.0		150	80	56
SolidColor:	91.5		145	70	48
SolidColor:	92.0		140	60	40
SolidColor:	92.5		135	50	32
SolidColor:	93.0		130	40	24
SolidColor:	93.5		125	30	16
SolidColor:	94.0		120	20	8
SolidColor:	94.5		115	10	1`

const velocity = 
`Product:bv
units: KTS
step: 5
scale: 1.9426

color: -140 255 204 230
color: -120 252 0 130 109 2 150 
color: -100 110 3 151 22 13 156
color: -90  24 39 165 30 111 188
color: -80 30 111 188 40 204 220
color: -70 47 222 226 181 237 239 
color: -50 181 237 239 2 241 3
color: -40 3 234 2  0 100 0
color: -10 78 121 76 116 131 112

color: 0 137 117 122 130 51 59 
color: 10 109 0 0 242 0 7
color: 40 249 51 76 255 149 207
color: 55 253 160 201 255 232 172
color: 60 253 228 160 253 149 83 
color: 80 254 142 80 110 14 9
color: 120 110 14 9
color: 140 0 0 0

RF: 139 0 218`
const velocity_balance = 
`Product: BV
Units:   ???
Step:    5
RF:      127	0	207
SolidColor:	1	25	30	70
SolidColor:	2	26	31	73
SolidColor:	3	27	33	76
SolidColor:	4	28	34	79
SolidColor:	5	29	35	82
SolidColor:	6	30	37	85
SolidColor:	7	31	38	88
SolidColor:	8	32	39	91
SolidColor:	9	33	41	95
SolidColor:	10	33	42	98
SolidColor:	11	34	43	101
SolidColor:	12	35	45	105
SolidColor:	13	36	46	108
SolidColor:	14	37	47	111
SolidColor:	15	37	48	115
SolidColor:	16	38	50	118
SolidColor:	17	39	51	122
SolidColor:	18	39	52	125
SolidColor:	19	40	54	129
SolidColor:	20	40	55	132
SolidColor:	21	41	56	136
SolidColor:	22	41	58	140
SolidColor:	23	41	59	143
SolidColor:	24	41	60	147
SolidColor:	25	41	62	151
SolidColor:	26	41	63	154
SolidColor:	27	41	64	158
SolidColor:	28	41	66	162
SolidColor:	29	40	67	165
SolidColor:	30	39	69	169
SolidColor:	31	38	71	172
SolidColor:	32	37	72	176
SolidColor:	33	35	74	179
SolidColor:	34	33	76	182
SolidColor:	35	31	78	184
SolidColor:	36	28	80	186
SolidColor:	37	25	82	188
SolidColor:	38	22	85	189
SolidColor:	39	19	87	190
SolidColor:	40	16	89	190
SolidColor:	41	13	91	190
SolidColor:	42	12	94	190
SolidColor:	43	10	96	190
SolidColor:	44	10	98	190
SolidColor:	45	10	100	190
SolidColor:	46	11	102	189
SolidColor:	47	13	104	189
SolidColor:	48	15	106	189
SolidColor:	49	17	108	188
SolidColor:	50	19	110	188
SolidColor:	51	22	112	188
SolidColor:	52	25	114	187
SolidColor:	53	27	116	187
SolidColor:	54	30	118	187
SolidColor:	55	33	120	187
SolidColor:	56	35	122	186
SolidColor:	57	38	123	186
SolidColor:	58	41	125	186
SolidColor:	59	43	127	186
SolidColor:	60	46	129	186
SolidColor:	61	48	131	186
SolidColor:	62	51	132	186
SolidColor:	63	54	134	186
SolidColor:	64	56	136	186
SolidColor:	65	59	137	186
SolidColor:	66	62	139	186
SolidColor:	67	64	141	186
SolidColor:	68	67	143	186
SolidColor:	69	70	144	186
SolidColor:	70	72	146	186
SolidColor:	71	75	148	186
SolidColor:	72	78	149	186
SolidColor:	73	81	151	186
SolidColor:	74	83	153	186
SolidColor:	75	86	154	187
SolidColor:	76	89	156	187
SolidColor:	77	92	157	187
SolidColor:	78	95	159	187
SolidColor:	79	98	160	187
SolidColor:	80	101	162	188
SolidColor:	81	104	164	188
SolidColor:	82	107	165	188
SolidColor:	83	110	167	189
SolidColor:	84	113	168	189
SolidColor:	85	117	170	190
SolidColor:	86	120	171	190
SolidColor:	87	123	172	191
SolidColor:	88	126	174	191
SolidColor:	89	129	175	192
SolidColor:	90	133	177	192
SolidColor:	91	136	178	193
SolidColor:	92	139	180	194
SolidColor:	93	142	181	195
SolidColor:	94	145	183	195
SolidColor:	95	148	184	196
SolidColor:	96	152	186	197
SolidColor:	97	155	187	198
SolidColor:	98	158	188	199
SolidColor:	99	161	190	200
SolidColor:	100	164	191	201
SolidColor:	101	167	193	202
SolidColor:	102	170	194	203
SolidColor:	103	173	196	204
SolidColor:	104	176	197	205
SolidColor:	105	179	199	206
SolidColor:	106	182	201	207
SolidColor:	107	185	202	208
SolidColor:	108	188	204	210
SolidColor:	109	191	205	211
SolidColor:	110	193	207	212
SolidColor:	111	196	208	213
SolidColor:	112	199	210	215
SolidColor:	113	202	212	216
SolidColor:	114	205	213	217
SolidColor:	115	208	215	218
SolidColor:	116	211	217	220
SolidColor:	117	213	218	221
SolidColor:	118	216	220	222
SolidColor:	119	219	222	224
SolidColor:	120	222	224	225
SolidColor:	121	225	225	227
SolidColor:	122	227	227	228
SolidColor:	123	230	229	230
SolidColor:	124	233	231	231
SolidColor:	125	235	233	233
SolidColor:	126	238	234	234
SolidColor:	127	241	236	236
SolidColor:	128	241	236	235
SolidColor:	129	240	234	233
SolidColor:	130	239	232	230
SolidColor:	131	238	229	227
SolidColor:	132	237	227	224
SolidColor:	133	236	224	222
SolidColor:	134	235	222	219
SolidColor:	135	234	220	216
SolidColor:	136	233	217	213
SolidColor:	137	232	215	210
SolidColor:	138	231	213	207
SolidColor:	139	230	210	205
SolidColor:	140	229	208	202
SolidColor:	141	229	206	199
SolidColor:	142	228	203	196
SolidColor:	143	227	201	193
SolidColor:	144	226	199	190
SolidColor:	145	225	196	187
SolidColor:	146	225	194	184
SolidColor:	147	224	192	181
SolidColor:	148	223	189	178
SolidColor:	149	223	187	176
SolidColor:	150	222	185	173
SolidColor:	151	221	182	170
SolidColor:	152	220	180	167
SolidColor:	153	220	178	164
SolidColor:	154	219	175	161
SolidColor:	155	218	173	158
SolidColor:	156	218	171	155
SolidColor:	157	217	169	152
SolidColor:	158	216	166	150
SolidColor:	159	216	164	147
SolidColor:	160	215	162	144
SolidColor:	161	214	159	141
SolidColor:	162	214	157	138
SolidColor:	163	213	155	135
SolidColor:	164	212	153	132
SolidColor:	165	211	150	129
SolidColor:	166	211	148	127
SolidColor:	167	210	146	124
SolidColor:	168	209	143	121
SolidColor:	169	209	141	118
SolidColor:	170	208	139	115
SolidColor:	171	207	137	112
SolidColor:	172	207	134	110
SolidColor:	173	206	132	107
SolidColor:	174	205	130	104
SolidColor:	175	205	127	101
SolidColor:	176	204	125	99
SolidColor:	177	203	123	96
SolidColor:	178	202	121	93
SolidColor:	179	202	118	91
SolidColor:	180	201	116	88
SolidColor:	181	200	114	85
SolidColor:	182	199	111	83
SolidColor:	183	199	109	80
SolidColor:	184	198	107	77
SolidColor:	185	197	104	75
SolidColor:	186	196	102	72
SolidColor:	187	195	99	70
SolidColor:	188	195	97	67
SolidColor:	189	194	95	65
SolidColor:	190	193	92	63
SolidColor:	191	192	90	60
SolidColor:	192	191	87	58
SolidColor:	193	190	85	56
SolidColor:	194	190	82	54
SolidColor:	195	189	80	52
SolidColor:	196	188	77	50
SolidColor:	197	187	75	48
SolidColor:	198	186	72	46
SolidColor:	199	185	69	44
SolidColor:	200	184	67	43
SolidColor:	201	183	64	41
SolidColor:	202	182	61	40
SolidColor:	203	180	59	39
SolidColor:	204	179	56	38
SolidColor:	205	178	53	37
SolidColor:	206	177	51	37
SolidColor:	207	175	48	36
SolidColor:	208	174	46	36
SolidColor:	209	172	43	36
SolidColor:	210	171	41	36
SolidColor:	211	169	38	36
SolidColor:	212	167	36	36
SolidColor:	213	165	33	37
SolidColor:	214	163	31	37
SolidColor:	215	161	29	37
SolidColor:	216	159	27	38
SolidColor:	217	157	25	38
SolidColor:	218	155	23	39
SolidColor:	219	153	22	39
SolidColor:	220	151	20	40
SolidColor:	221	148	19	40
SolidColor:	222	146	18	40
SolidColor:	223	144	16	41
SolidColor:	224	141	16	41
SolidColor:	225	139	15	41
SolidColor:	226	136	15	41
SolidColor:	227	134	14	41
SolidColor:	228	131	14	41
SolidColor:	229	128	14	41
SolidColor:	230	126	14	41
SolidColor:	231	123	14	41
SolidColor:	232	120	14	40
SolidColor:	233	118	14	40
SolidColor:	234	115	14	39
SolidColor:	235	112	14	39
SolidColor:	236	109	14	38
SolidColor:	237	107	15	37
SolidColor:	238	104	15	37
SolidColor:	239	101	15	36
SolidColor:	240	99	14	35
SolidColor:	241	96	14	34
SolidColor:	242	94	14	33
SolidColor:	243	91	14	32
SolidColor:	244	88	14	31
SolidColor:	245	86	14	30
SolidColor:	246	83	13	29
SolidColor:	247	81	13	28
SolidColor:	248	78	13	27
SolidColor:	249	75	12	25
SolidColor:	250	73	12	24
SolidColor:	251	70	11	23
SolidColor:	252	68	11	22
SolidColor:	253	65	10	20
SolidColor:	254	63	10	19`

const diff_reflectivity = 
`Product: ZDR
Units:   DB
Step:    5

SolidColor:	-7.875	135	  0	135
SolidColor:	-7.813	  0	  0	  0
SolidColor:	-7.751	  0	  0	  0
SolidColor:	-7.689	  0	  0	  0
SolidColor:	-7.627	  0	  0	  0
SolidColor:	-7.565	  0	  0	  0
SolidColor:	-7.503	  0	  0	  0
SolidColor:	-7.441	  0	  0	  0
SolidColor:	-7.379	  0	  0	  0
SolidColor:	-7.317	  0	  0	  0
SolidColor:	-7.255	  0	  0	  0
SolidColor:	-7.193	  0	  0	  0
SolidColor:	-7.131	  0	  0	  0
SolidColor:	-7.069	  0	  0	  0
SolidColor:	-7.007	  0	  0	  0
SolidColor:	-6.945	  0	  0	  0
SolidColor:	-6.883	  0	  0	  0
SolidColor:	-6.821	  0	  0	  0
SolidColor:	-6.759	  0	  0	  0
SolidColor:	-6.697	  0	  0	  0
SolidColor:	-6.635	  0	  0	  0
SolidColor:	-6.573	  0	  0	  0
SolidColor:	-6.511	  0	  0	  0
SolidColor:	-6.449	  0	  0	  0
SolidColor:	-6.387	  0	  0	  0
SolidColor:	-6.325	  0	  0	  0
SolidColor:	-6.263	  0	  0	  0
SolidColor:	-6.201	  0	  0	  0
SolidColor:	-6.139	  0	  0	  0
SolidColor:	-6.077	  0	  0	  0
SolidColor:	-6.015	  0	  0	  0
SolidColor:	-5.953	  0	  0	  0
SolidColor:	-5.891	  0	  0	  0
SolidColor:	-5.829	  0	  0	  0
SolidColor:	-5.767	  0	  0	  0
SolidColor:	-5.705	  0	  0	  0
SolidColor:	-5.643	  0	  0	  0
SolidColor:	-5.581	  0	  0	  0
SolidColor:	-5.519	  0	  0	  0
SolidColor:	-5.457	  0	  0	  0
SolidColor:	-5.395	  0	  0	  0
SolidColor:	-5.333	  0	  0	  0
SolidColor:	-5.271	  0	  0	  0
SolidColor:	-5.209	  0	  0	  0
SolidColor:	-5.147	  0	  0	  0
SolidColor:	-5.085	  0	  0	  0
SolidColor:	-5.023	  0	  0	  0
SolidColor:	-4.961	  0	  0	  0
SolidColor:	-4.899	  0	  0	  0
SolidColor:	-4.837	  0	  0	  0
SolidColor:	-4.775	  0	  0	  0
SolidColor:	-4.713	  0	  0	  0
SolidColor:	-4.651	  0	  0	  0
SolidColor:	-4.589	  0	  0	  0
SolidColor:	-4.527	  0	  0	  0
SolidColor:	-4.465	  0	  0	  0
SolidColor:	-4.403	  0	  0	  0
SolidColor:	-4.341	  0	  0	  0
SolidColor:	-4.279	  0	  0	  0
SolidColor:	-4.217	  0	  0	  0
SolidColor:	-4.155	  0	  0	  0
SolidColor:	-4.093	  0	  0	  0
SolidColor:	-4.031	  0	  0	  0
SolidColor:	-3.969	  0	  0	  0
SolidColor:	-3.906	  3	  3	  3
SolidColor:	-3.844	  6	  6	  6
SolidColor:	-3.782	  9	  9	  9
SolidColor:	-3.720	 12	 12	 12
SolidColor:	-3.658	 15	 15	 15
SolidColor:	-3.596	 18	 18	 18
SolidColor:	-3.534	 21	 21	 21
SolidColor:	-3.472	 25	 25	 25
SolidColor:	-3.410	 28	 28	 28
SolidColor:	-3.348	 31	 31	 31
SolidColor:	-3.286	 34	 34	 34
SolidColor:	-3.224	 37	 37	 37
SolidColor:	-3.162	 40	 40	 40
SolidColor:	-3.100	 43	 43	 43
SolidColor:	-3.038	 46	 46	 46
SolidColor:	-2.976	 50	 50	 50
SolidColor:	-2.914	 53	 53	 53
SolidColor:	-2.852	 56	 56	 56
SolidColor:	-2.790	 59	 59	 59
SolidColor:	-2.728	 62	 62	 62
SolidColor:	-2.666	 65	 65	 65
SolidColor:	-2.604	 68	 68	 68
SolidColor:	-2.542	 71	 71	 71
SolidColor:	-2.480	 75	 75	 75
SolidColor:	-2.418	 78	 78	 78
SolidColor:	-2.356	 81	 81	 81
SolidColor:	-2.294	 84	 84	 84
SolidColor:	-2.232	 87	 87	 87
SolidColor:	-2.170	 90	 90	 90
SolidColor:	-2.108	 93	 93	 93
SolidColor:	-2.046	 96	 96	 96
SolidColor:	-1.984	100	100	100
SolidColor:	-1.922	102	102	102
SolidColor:	-1.860	104	104	104
SolidColor:	-1.798	107	107	107
SolidColor:	-1.736	109	109	109
SolidColor:	-1.674	111	111	111
SolidColor:	-1.612	114	114	114
SolidColor:	-1.550	116	116	116
SolidColor:	-1.488	118	118	118
SolidColor:	-1.426	121	121	121
SolidColor:	-1.364	123	123	123
SolidColor:	-1.302	125	125	125
SolidColor:	-1.240	128	128	128
SolidColor:	-1.178	130	130	130
SolidColor:	-1.116	132	132	132
SolidColor:	-1.054	135	135	135
SolidColor:	-0.992	137	137	137
SolidColor:	-0.930	139	139	139
SolidColor:	-0.868	142	142	142
SolidColor:	-0.806	144	144	144
SolidColor:	-0.744	146	146	146
SolidColor:	-0.682	148	148	148
SolidColor:	-0.620	151	151	151
SolidColor:	-0.558	153	153	153
SolidColor:	-0.496	156	156	156
SolidColor:	-0.434	161	161	161
SolidColor:	-0.372	167	167	167
SolidColor:	-0.310	172	172	172
SolidColor:	-0.248	178	178	178
SolidColor:	-0.186	184	184	184
SolidColor:	-0.124	189	189	189
SolidColor:	-0.062	195	195	195
SolidColor:	 0.000	201	201	201
SolidColor:	 0.062	185	180	195
SolidColor:	 0.124	170	160	190
SolidColor:	 0.186	155	140	185
SolidColor:	 0.248	140	120	180
SolidColor:	 0.310	105	 89	173
SolidColor:	 0.372	 70	 59	166
SolidColor:	 0.434	 35	 29	159
SolidColor:	 0.496	  0	  0	152
SolidColor:	 0.558	  4	 19	159
SolidColor:	 0.620	  8	 38	166
SolidColor:	 0.682	 13	 56	174
SolidColor:	 0.744	 17	 76	181
SolidColor:	 0.806	 21	 95	188
SolidColor:	 0.868	 26	114	196
SolidColor:	 0.930	 30	133	203
SolidColor:	 0.992	 35	152	211
SolidColor:	 1.054	 39	164	210
SolidColor:	 1.116	 43	177	210
SolidColor:	 1.178	 47	190	210
SolidColor:	 1.240	 51	203	210
SolidColor:	 1.302	 55	216	210
SolidColor:	 1.364	 59	229	210
SolidColor:	 1.426	 63	242	210
SolidColor:	 1.488	 68	255	210
SolidColor:	 1.550	 70	250	194
SolidColor:	 1.612	 72	245	179
SolidColor:	 1.674	 75	241	163
SolidColor:	 1.736	 77	236	147
SolidColor:	 1.798	 79	232	132
SolidColor:	 1.860	 82	227	116
SolidColor:	 1.922	 84	223	101
SolidColor:	 1.984	 87	219	 86
SolidColor:	 2.046	108	223	 87
SolidColor:	 2.108	129	228	 88
SolidColor:	 2.170	150	232	 89
SolidColor:	 2.232	171	237	 90
SolidColor:	 2.294	192	241	 92
SolidColor:	 2.356	213	246	 93
SolidColor:	 2.418	234	250	 94
SolidColor:	 2.480	255	255	 96
SolidColor:	 2.542	255	241	 92
SolidColor:	 2.604	255	227	 89
SolidColor:	 2.666	255	213	 85
SolidColor:	 2.728	255	199	 82
SolidColor:	 2.790	255	185	 79
SolidColor:	 2.852	255	171	 75
SolidColor:	 2.914	255	157	 72
SolidColor:	 2.976	255	144	 69
SolidColor:	 3.038	252	135	 64
SolidColor:	 3.100	250	126	 60
SolidColor:	 3.162	248	117	 56
SolidColor:	 3.224	245	108	 51
SolidColor:	 3.286	243	 99	 47
SolidColor:	 3.348	241	 90	 43
SolidColor:	 3.410	238	 81	 38
SolidColor:	 3.472	236	 72	 34
SolidColor:	 3.534	234	 63	 30
SolidColor:	 3.596	231	 54	 25
SolidColor:	 3.658	229	 45	 21
SolidColor:	 3.720	227	 36	 17
SolidColor:	 3.782	224	 27	 12
SolidColor:	 3.844	222	 18	  8
SolidColor:	 3.906	220	  9	  4
SolidColor:	 3.969	218	  0	  0
SolidColor:	 4.031	215	  0	  0
SolidColor:	 4.093	212	  0	  0
SolidColor:	 4.155	209	  0	  0
SolidColor:	 4.217	207	  0	  0
SolidColor:	 4.279	204	  0	  0
SolidColor:	 4.341	201	  0	  0
SolidColor:	 4.403	198	  0	  0
SolidColor:	 4.465	196	  0	  0
SolidColor:	 4.527	193	  0	  0
SolidColor:	 4.589	190	  0	  0
SolidColor:	 4.651	187	  0	  0
SolidColor:	 4.713	185	  0	  0
SolidColor:	 4.775	182	  0	  0
SolidColor:	 4.837	179	  0	  0
SolidColor:	 4.899	176	  0	  0
SolidColor:	 4.961	174	  0	  0
SolidColor:	 5.023	178	  8	 11
SolidColor:	 5.085	183	 16	 23
SolidColor:	 5.147	187	 24	 35
SolidColor:	 5.209	192	 32	 47
SolidColor:	 5.271	196	 40	 59
SolidColor:	 5.333	201	 48	 71
SolidColor:	 5.395	205	 56	 83
SolidColor:	 5.457	210	 65	 95
SolidColor:	 5.519	215	 73	106
SolidColor:	 5.581	219	 81	118
SolidColor:	 5.643	224	 89	130
SolidColor:	 5.705	228	 97	142
SolidColor:	 5.767	233	105	154
SolidColor:	 5.829	237	113	166
SolidColor:	 5.891	242	121	178
SolidColor:	 5.953	247	130	190
SolidColor:	 6.015	247	134	192
SolidColor:	 6.077	247	138	194
SolidColor:	 6.139	247	142	196
SolidColor:	 6.201	248	146	198
SolidColor:	 6.263	248	150	200
SolidColor:	 6.325	248	155	202
SolidColor:	 6.387	248	159	205
SolidColor:	 6.449	249	163	207
SolidColor:	 6.511	249	167	209
SolidColor:	 6.573	249	171	211
SolidColor:	 6.635	249	175	213
SolidColor:	 6.697	250	180	215
SolidColor:	 6.759	250	184	218
SolidColor:	 6.821	250	188	220
SolidColor:	 6.883	250	192	222
SolidColor:	 6.945	251	196	224
SolidColor:	 7.007	251	200	226
SolidColor:	 7.069	251	205	228
SolidColor:	 7.131	252	209	231
SolidColor:	 7.193	252	213	233
SolidColor:	 7.255	252	217	235
SolidColor:	 7.317	252	221	237
SolidColor:	 7.379	253	225	239
SolidColor:	 7.441	253	230	241
SolidColor:	 7.503	253	234	244
SolidColor:	 7.565	253	238	246
SolidColor:	 7.627	254	242	248
SolidColor:	 7.689	254	246	250
SolidColor:	 7.751	254	250	252
SolidColor:	 7.813	255	255	255
SolidColor:	 7.875	255	255	255`

const corr_coeff = 
`Product: CC
Units:	 NONE
Step:    5
SolidColor:	0.208	  0	  0	  0
SolidColor:	0.211	135	  0	135
SolidColor:	0.215	  0	  0	  0
SolidColor:	0.218	  2	  2	  2
SolidColor:	0.221	  4	  4	  4
SolidColor:	0.225	  6	  6	  6
SolidColor:	0.228	  8	  8	  8
SolidColor:	0.231	 10	 10	 10
SolidColor:	0.234	 12	 12	 13
SolidColor:	0.238	 14	 14	 15
SolidColor:	0.241	 16	 16	 17
SolidColor:	0.244	 18	 18	 19
SolidColor:	0.248	 20	 20	 21
SolidColor:	0.251	 22	 22	 23
SolidColor:	0.254	 24	 24	 25
SolidColor:	0.258	 26	 26	 28
SolidColor:	0.261	 28	 28	 30
SolidColor:	0.264	 31	 30	 32
SolidColor:	0.268	 33	 32	 34
SolidColor:	0.271	 35	 34	 36
SolidColor:	0.274	 37	 37	 38
SolidColor:	0.277	 39	 39	 41
SolidColor:	0.281	 41	 41	 43
SolidColor:	0.284	 43	 43	 45
SolidColor:	0.287	 45	 45	 47
SolidColor:	0.291	 47	 47	 49
SolidColor:	0.294	 49	 49	 51
SolidColor:	0.297	 51	 51	 54
SolidColor:	0.301	 53	 53	 56
SolidColor:	0.304	 55	 55	 58
SolidColor:	0.307	 57	 57	 60
SolidColor:	0.311	 60	 59	 62
SolidColor:	0.314	 62	 61	 65
SolidColor:	0.317	 64	 63	 67
SolidColor:	0.320	 66	 65	 69
SolidColor:	0.324	 68	 67	 71
SolidColor:	0.327	 70	 69	 73
SolidColor:	0.330	 72	 71	 75
SolidColor:	0.334	 74	 74	 78
SolidColor:	0.337	 76	 76	 80
SolidColor:	0.340	 78	 78	 82
SolidColor:	0.344	 80	 80	 84
SolidColor:	0.347	 82	 82	 86
SolidColor:	0.350	 84	 84	 88
SolidColor:	0.354	 86	 86	 91
SolidColor:	0.357	 88	 88	 93
SolidColor:	0.360	 91	 90	 95
SolidColor:	0.363	 93	 92	 97
SolidColor:	0.367	 95	 94	 99
SolidColor:	0.370	 97	 96	101
SolidColor:	0.373	 99	 98	104
SolidColor:	0.377	101	100	106
SolidColor:	0.380	103	102	108
SolidColor:	0.383	105	104	110
SolidColor:	0.387	107	106	112
SolidColor:	0.390	109	108	114
SolidColor:	0.393	111	111	117
SolidColor:	0.397	113	113	119
SolidColor:	0.400	115	115	121
SolidColor:	0.403	117	117	123
SolidColor:	0.406	120	119	125
SolidColor:	0.410	122	121	127
SolidColor:	0.413	124	123	130
SolidColor:	0.416	126	125	132
SolidColor:	0.420	128	127	134
SolidColor:	0.423	130	129	136
SolidColor:	0.426	132	131	138
SolidColor:	0.430	134	133	140
SolidColor:	0.433	136	135	143
SolidColor:	0.436	138	137	145
SolidColor:	0.439	140	139	147
SolidColor:	0.443	142	141	149
SolidColor:	0.446	144	143	151
SolidColor:	0.449	146	145	153
SolidColor:	0.453	149	148	156
SolidColor:	0.456	146	145	155
SolidColor:	0.459	144	143	155
SolidColor:	0.463	142	141	155
SolidColor:	0.466	140	139	154
SolidColor:	0.469	138	137	154
SolidColor:	0.473	136	135	154
SolidColor:	0.476	134	133	154
SolidColor:	0.479	132	130	153
SolidColor:	0.482	129	128	153
SolidColor:	0.486	127	126	153
SolidColor:	0.489	125	124	153
SolidColor:	0.492	123	122	152
SolidColor:	0.496	121	120	152
SolidColor:	0.499	119	118	152
SolidColor:	0.502	117	115	152
SolidColor:	0.506	115	113	151
SolidColor:	0.509	113	111	151
SolidColor:	0.512	110	109	151
SolidColor:	0.516	108	107	150
SolidColor:	0.519	106	105	150
SolidColor:	0.522	104	103	150
SolidColor:	0.525	102	101	150
SolidColor:	0.529	100	 98	149
SolidColor:	0.532	 98	 96	149
SolidColor:	0.535	 96	 94	149
SolidColor:	0.539	 93	 92	149
SolidColor:	0.542	 91	 90	148
SolidColor:	0.545	 89	 88	148
SolidColor:	0.549	 87	 86	148
SolidColor:	0.552	 85	 83	148
SolidColor:	0.555	 83	 81	147
SolidColor:	0.559	 81	 79	147
SolidColor:	0.562	 79	 77	147
SolidColor:	0.565	 77	 75	146
SolidColor:	0.568	 74	 73	146
SolidColor:	0.572	 72	 71	146
SolidColor:	0.575	 70	 69	146
SolidColor:	0.578	 68	 66	145
SolidColor:	0.582	 66	 64	145
SolidColor:	0.585	 64	 62	145
SolidColor:	0.588	 62	 60	145
SolidColor:	0.592	 60	 58	144
SolidColor:	0.595	 57	 56	144
SolidColor:	0.598	 55	 54	144
SolidColor:	0.602	 53	 51	144
SolidColor:	0.605	 51	 49	143
SolidColor:	0.608	 49	 47	143
SolidColor:	0.611	 47	 45	143
SolidColor:	0.615	 45	 43	142
SolidColor:	0.618	 43	 41	142
SolidColor:	0.621	 41	 39	142
SolidColor:	0.625	 38	 37	142
SolidColor:	0.628	 36	 34	141
SolidColor:	0.631	 34	 32	141
SolidColor:	0.635	 32	 30	141
SolidColor:	0.638	 30	 28	141
SolidColor:	0.641	 28	 26	140
SolidColor:	0.645	 26	 24	140
SolidColor:	0.648	 24	 22	140
SolidColor:	0.651	 22	 20	140
SolidColor:	0.654	 21	 19	142
SolidColor:	0.658	 21	 18	145
SolidColor:	0.661	 20	 18	147
SolidColor:	0.664	 20	 17	150
SolidColor:	0.668	 19	 17	152
SolidColor:	0.671	 19	 16	155
SolidColor:	0.674	 18	 15	157
SolidColor:	0.678	 18	 15	160
SolidColor:	0.681	 18	 14	163
SolidColor:	0.684	 17	 14	165
SolidColor:	0.688	 17	 13	168
SolidColor:	0.691	 16	 12	170
SolidColor:	0.694	 16	 12	173
SolidColor:	0.697	 15	 11	175
SolidColor:	0.701	 15	 11	178
SolidColor:	0.704	 15	 10	181
SolidColor:	0.707	 14	  9	183
SolidColor:	0.711	 14	  9	186
SolidColor:	0.714	 13	  8	188
SolidColor:	0.717	 13	  8	191
SolidColor:	0.721	 12	  7	193
SolidColor:	0.724	 12	  6	196
SolidColor:	0.727	 12	  6	199
SolidColor:	0.731	 11	  5	201
SolidColor:	0.734	 11	  5	204
SolidColor:	0.737	 10	  4	206
SolidColor:	0.740	 10	  3	209
SolidColor:	0.744	  9	  3	211
SolidColor:	0.747	  9	  2	214
SolidColor:	0.750	  9	  2	217
SolidColor:	0.754	 17	 10	216
SolidColor:	0.757	 26	 19	216
SolidColor:	0.760	 34	 28	216
SolidColor:	0.764	 43	 37	216
SolidColor:	0.767	 51	 46	216
SolidColor:	0.770	 60	 55	215
SolidColor:	0.774	 68	 64	215
SolidColor:	0.777	 77	 72	215
SolidColor:	0.780	 85	 81	215
SolidColor:	0.783	 94	 90	215
SolidColor:	0.787	102	 99	214
SolidColor:	0.790	111	108	214
SolidColor:	0.793	119	117	214
SolidColor:	0.797	128	126	214
SolidColor:	0.800	137	135	214
SolidColor:	0.803	134	143	205
SolidColor:	0.807	131	151	197
SolidColor:	0.810	128	159	189
SolidColor:	0.813	125	167	180
SolidColor:	0.817	122	175	172
SolidColor:	0.820	119	183	164
SolidColor:	0.823	116	191	155
SolidColor:	0.826	113	199	147
SolidColor:	0.830	110	207	139
SolidColor:	0.833	107	215	130
SolidColor:	0.836	104	223	122
SolidColor:	0.840	101	231	114
SolidColor:	0.843	 97	239	105
SolidColor:	0.846	 94	247	 97
SolidColor:	0.850	 92	255	 89
SolidColor:	0.853	 95	251	 83
SolidColor:	0.856	 98	248	 77
SolidColor:	0.859	101	245	 71
SolidColor:	0.863	104	242	 65
SolidColor:	0.866	107	238	 59
SolidColor:	0.869	110	235	 54
SolidColor:	0.873	113	232	 48
SolidColor:	0.876	117	229	 42
SolidColor:	0.879	120	226	 36
SolidColor:	0.883	123	222	 30
SolidColor:	0.886	126	219	 25
SolidColor:	0.889	129	216	 19
SolidColor:	0.893	132	213	 13
SolidColor:	0.896	135	210	  7
SolidColor:	0.899	139	207	  2
SolidColor:	0.902	146	206	  1
SolidColor:	0.906	154	205	  1
SolidColor:	0.909	162	204	  1
SolidColor:	0.912	169	204	  1
SolidColor:	0.916	177	203	  1
SolidColor:	0.919	185	202	  1
SolidColor:	0.922	193	201	  1
SolidColor:	0.926	200	201	  0
SolidColor:	0.929	208	200	  0
SolidColor:	0.932	216	199	  0
SolidColor:	0.936	224	198	  0
SolidColor:	0.939	231	198	  0
SolidColor:	0.942	239	197	  0
SolidColor:	0.945	247	196	  0
SolidColor:	0.949	255	196	  0
SolidColor:	0.952	255	176	  1
SolidColor:	0.955	255	156	  2
SolidColor:	0.959	255	137	  3
SolidColor:	0.962	255	105	  2
SolidColor:	0.965	255	 74	  1
SolidColor:	0.969	255	 43	  0
SolidColor:	0.972	245	 28	  0
SolidColor:	0.975	236	 14	  0
SolidColor:	0.979	227	  0	  0
SolidColor:	0.982	204	  0	  0
SolidColor:	0.985	182	  0	  0
SolidColor:	0.988	161	  0	  0
SolidColor:	0.992	157	  1	 28
SolidColor:	0.995	154	  3	 57
SolidColor:	0.998	151	  5	 86
SolidColor:	1.002	158	 16	 94
SolidColor:	1.005	165	 28	103
SolidColor:	1.008	172	 40	112
SolidColor:	1.012	179	 52	121
SolidColor:	1.015	186	 64	129
SolidColor:	1.018	193	 76	138
SolidColor:	1.022	200	 88	147
SolidColor:	1.025	207	100	156
SolidColor:	1.028	214	112	165
SolidColor:	1.031	221	124	173
SolidColor:	1.035	228	136	182
SolidColor:	1.038	235	148	191
SolidColor:	1.041	242	160	200
SolidColor:	1.045	250	172	209
SolidColor:	1.048	255	255	255`

const spectrum_width = {
    colors: [
        '#242424',
        '#afafaf',
        '#ff700a',
        '#b30000',
        '#f000ac',
        '#8800c2',
        '#e0fcff',
        '#b4eb00',
        '#7dd100',
    ],
    values: [
        0, 5, 8, 10, 13, 15.5, 18, 20.5, 31 // m/s
        // yes, those are strange values. here are the originals in knots:
        // 0, 10, 15, 20, 25, 30, 35, 40, 60
    ],
}

const hydrometer_class = 
`Product: HC
Units:   NONE
Step:    1

SolidColor:	 10	156	156	156
SolidColor:	 20	118	118	118
SolidColor:	 30	255	176	176
SolidColor:	 40	  0	255	255
SolidColor:	 50	  0	144	255
SolidColor:	 60	  0	251	144
SolidColor:	 70	  0	187	  0
SolidColor:	 80	208	208	 96
SolidColor:	 90	210	132	132
SolidColor:	100	255	  0	  0
SolidColor:	110	160	 20	 20
SolidColor:	120	255	255	  0
SolidColor:	130	  0	  0	  0
SolidColor:	140	231	  0	255
SolidColor:	150	119	  0	125`

const specific_differential_phase = 
`Product: KDP
Units:   Deg/km
Step:    5
SolidColor:	-2.05	135	  0	135
SolidColor:	-2.00	  0	  0	  0
SolidColor:	-1.96	  5	  5	  5
SolidColor:	-1.91	 11	 11	 11
SolidColor:	-1.86	 16	 16	 16
SolidColor:	-1.81	 22	 22	 22
SolidColor:	-1.77	 28	 28	 28
SolidColor:	-1.72	 33	 33	 33
SolidColor:	-1.67	 39	 39	 39
SolidColor:	-1.62	 44	 44	 44
SolidColor:	-1.58	 50	 50	 50
SolidColor:	-1.53	 56	 56	 56
SolidColor:	-1.48	 61	 61	 61
SolidColor:	-1.44	 67	 67	 67
SolidColor:	-1.39	 73	 73	 73
SolidColor:	-1.34	 78	 78	 78
SolidColor:	-1.29	 84	 84	 84
SolidColor:	-1.25	 89	 89	 89
SolidColor:	-1.20	 95	 95	 95
SolidColor:	-1.15	101	101	101
SolidColor:	-1.11	106	106	106
SolidColor:	-1.06	112	112	112
SolidColor:	-1.01	118	118	118
SolidColor:	-0.96	113	106	106
SolidColor:	-0.92	109	 94	 94
SolidColor:	-0.87	105	 82	 82
SolidColor:	-0.82	100	 70	 70
SolidColor:	-0.77	 96	 59	 59
SolidColor:	-0.73	 92	 47	 47
SolidColor:	-0.68	 87	 35	 35
SolidColor:	-0.63	 83	 23	 23
SolidColor:	-0.59	 79	 11	 11
SolidColor:	-0.54	 75	  0	  0
SolidColor:	-0.49	 79	  0	  2
SolidColor:	-0.44	 83	  0	  5
SolidColor:	-0.40	 87	  0	  7
SolidColor:	-0.35	 91	  0	 10
SolidColor:	-0.30	 95	  0	 12
SolidColor:	-0.25	 99	  0	 15
SolidColor:	-0.21	103	  0	 17
SolidColor:	-0.16	107	  0	 20
SolidColor:	-0.11	111	  0	 22
SolidColor:	-0.07	115	  0	 25
SolidColor:	-0.02	120	  0	 26
SolidColor:	 0.03	125	  1	 28
SolidColor:	 0.08	130	  2	 30
SolidColor:	 0.12	135	  3	 32
SolidColor:	 0.17	140	  4	 34
SolidColor:	 0.22	145	  4	 36
SolidColor:	 0.26	150	  5	 38
SolidColor:	 0.31	155	  6	 40
SolidColor:	 0.36	160	  7	 42
SolidColor:	 0.41	165	  8	 44
SolidColor:	 0.45	169	 14	 48
SolidColor:	 0.50	174	 20	 53
SolidColor:	 0.55	179	 26	 58
SolidColor:	 0.60	184	 33	 63
SolidColor:	 0.64	188	 39	 68
SolidColor:	 0.69	193	 45	 72
SolidColor:	 0.74	198	 52	 77
SolidColor:	 0.78	203	 58	 82
SolidColor:	 0.83	208	 64	 87
SolidColor:	 0.88	213	 71	 92
SolidColor:	 0.93	215	 75	101
SolidColor:	 0.97	217	 80	110
SolidColor:	 1.02	219	 85	119
SolidColor:	 1.07	221	 90	129
SolidColor:	 1.12	224	 95	138
SolidColor:	 1.16	226	100	147
SolidColor:	 1.21	228	105	157
SolidColor:	 1.26	230	110	166
SolidColor:	 1.30	232	115	175
SolidColor:	 1.35	235	120	185
SolidColor:	 1.40	226	120	184
SolidColor:	 1.45	218	121	184
SolidColor:	 1.49	209	122	184
SolidColor:	 1.54	201	123	184
SolidColor:	 1.59	192	124	184
SolidColor:	 1.64	184	125	183
SolidColor:	 1.68	175	126	183
SolidColor:	 1.73	167	127	183
SolidColor:	 1.78	158	128	183
SolidColor:	 1.82	150	129	183
SolidColor:	 1.87	145	118	184
SolidColor:	 1.92	141	107	185
SolidColor:	 1.97	137	 96	186
SolidColor:	 2.01	132	 85	187
SolidColor:	 2.06	128	 74	188
SolidColor:	 2.11	124	 63	190
SolidColor:	 2.15	119	 52	191
SolidColor:	 2.20	115	 41	192
SolidColor:	 2.25	111	 30	193
SolidColor:	 2.30	107	 20	195
SolidColor:	 2.34	106	 43	200
SolidColor:	 2.39	105	 67	206
SolidColor:	 2.44	104	 90	211
SolidColor:	 2.49	103	114	217
SolidColor:	 2.53	102	137	222
SolidColor:	 2.58	101	161	228
SolidColor:	 2.63	100	184	233
SolidColor:	 2.67	 99	208	239
SolidColor:	 2.72	 98	231	244
SolidColor:	 2.77	 98	255	250
SolidColor:	 2.82	 90	248	229
SolidColor:	 2.86	 82	241	210
SolidColor:	 2.91	 74	234	190
SolidColor:	 2.96	 66	227	170
SolidColor:	 3.01	 59	219	150
SolidColor:	 3.05	 51	212	130
SolidColor:	 3.10	 43	205	110
SolidColor:	 3.15	 35	198	 90
SolidColor:	 3.19	 27	191	 70
SolidColor:	 3.24	 20	185	 50
SolidColor:	 3.29	 19	192	 46
SolidColor:	 3.34	 18	199	 42
SolidColor:	 3.38	 17	206	 38
SolidColor:	 3.43	 16	213	 34
SolidColor:	 3.48	 15	220	 30
SolidColor:	 3.52	 14	227	 26
SolidColor:	 3.57	 13	234	 22
SolidColor:	 3.62	 12	241	 18
SolidColor:	 3.67	 11	248	 14
SolidColor:	 3.71	 10	255	 10
SolidColor:	 3.76	 22	255	  9
SolidColor:	 3.81	 34	255	  9
SolidColor:	 3.86	 46	255	  8
SolidColor:	 3.90	 58	255	  8
SolidColor:	 3.95	 71	255	  7
SolidColor:	 4.00	 83	255	  7
SolidColor:	 4.04	 95	255	  6
SolidColor:	 4.09	108	255	  6
SolidColor:	 4.14	120	255	  5
SolidColor:	 4.19	132	255	  5
SolidColor:	 4.23	144	255	  4
SolidColor:	 4.28	157	255	  4
SolidColor:	 4.33	169	255	  3
SolidColor:	 4.38	181	255	  3
SolidColor:	 4.42	193	255	  2
SolidColor:	 4.47	206	255	  2
SolidColor:	 4.52	218	255	  1
SolidColor:	 4.56	230	255	  1
SolidColor:	 4.61	242	255	  0
SolidColor:	 4.66	255	255	  0
SolidColor:	 4.71	255	248	  1
SolidColor:	 4.75	255	241	  2
SolidColor:	 4.80	255	234	  3
SolidColor:	 4.85	255	227	  4
SolidColor:	 4.89	255	221	  5
SolidColor:	 4.94	255	214	  6
SolidColor:	 4.99	255	207	  7
SolidColor:	 5.04	255	200	  8
SolidColor:	 5.08	255	194	  9
SolidColor:	 5.13	255	187	 10
SolidColor:	 5.18	255	180	 11
SolidColor:	 5.23	255	173	 12
SolidColor:	 5.27	255	167	 13
SolidColor:	 5.32	255	160	 14
SolidColor:	 5.37	255	153	 15
SolidColor:	 5.41	255	146	 16
SolidColor:	 5.46	255	140	 17
SolidColor:	 5.51	255	133	 18
SolidColor:	 5.56	255	126	 19
SolidColor:	 5.60	255	120	 20
SolidColor:	 5.65	255	122	 22
SolidColor:	 5.70	255	124	 25
SolidColor:	 5.75	255	126	 28
SolidColor:	 5.79	255	128	 31
SolidColor:	 5.84	255	130	 33
SolidColor:	 5.89	255	132	 36
SolidColor:	 5.93	255	134	 39
SolidColor:	 5.98	255	137	 41
SolidColor:	 6.03	255	139	 44
SolidColor:	 6.08	255	141	 47
SolidColor:	 6.12	255	143	 50
SolidColor:	 6.17	255	145	 52
SolidColor:	 6.22	255	147	 55
SolidColor:	 6.26	255	149	 58
SolidColor:	 6.31	255	151	 61
SolidColor:	 6.36	255	153	 63
SolidColor:	 6.41	255	156	 66
SolidColor:	 6.45	255	158	 69
SolidColor:	 6.50	255	160	 72
SolidColor:	 6.55	255	162	 74
SolidColor:	 6.60	255	164	 77
SolidColor:	 6.64	255	166	 80
SolidColor:	 6.69	255	168	 83
SolidColor:	 6.74	255	170	 86
SolidColor:	 6.78	255	173	 88
SolidColor:	 6.83	255	175	 91
SolidColor:	 6.88	255	177	 94
SolidColor:	 6.93	255	179	 97
SolidColor:	 6.97	255	181	 99
SolidColor:	 7.02	255	183	102
SolidColor:	 7.07	255	185	105
SolidColor:	 7.12	255	187	108
SolidColor:	 7.16	255	190	110
SolidColor:	 7.21	255	192	113
SolidColor:	 7.26	255	194	116
SolidColor:	 7.30	255	196	119
SolidColor:	 7.35	255	198	121
SolidColor:	 7.40	255	200	124
SolidColor:	 7.45	255	202	127
SolidColor:	 7.49	255	205	130
SolidColor:	 7.54	255	205	132
SolidColor:	 7.59	255	206	134
SolidColor:	 7.64	255	207	137
SolidColor:	 7.68	255	208	139
SolidColor:	 7.73	255	209	142
SolidColor:	 7.78	255	210	144
SolidColor:	 7.82	255	211	147
SolidColor:	 7.87	255	212	149
SolidColor:	 7.92	255	213	152
SolidColor:	 7.97	255	214	154
SolidColor:	 8.01	255	215	156
SolidColor:	 8.06	255	216	159
SolidColor:	 8.11	255	217	161
SolidColor:	 8.15	255	218	164
SolidColor:	 8.20	255	219	166
SolidColor:	 8.25	255	220	169
SolidColor:	 8.30	255	221	171
SolidColor:	 8.34	255	222	174
SolidColor:	 8.39	255	223	176
SolidColor:	 8.44	255	224	179
SolidColor:	 8.49	255	225	181
SolidColor:	 8.53	255	226	183
SolidColor:	 8.58	255	227	186
SolidColor:	 8.63	255	228	188
SolidColor:	 8.67	255	229	191
SolidColor:	 8.72	255	230	193
SolidColor:	 8.77	255	231	196
SolidColor:	 8.82	255	232	198
SolidColor:	 8.86	255	233	201
SolidColor:	 8.91	255	234	203
SolidColor:	 8.96	255	235	205
SolidColor:	 9.01	255	236	208
SolidColor:	 9.05	255	237	210
SolidColor:	 9.10	255	238	213
SolidColor:	 9.15	255	239	215
SolidColor:	 9.19	255	240	218
SolidColor:	 9.24	255	241	220
SolidColor:	 9.29	255	242	223
SolidColor:	 9.34	255	243	225
SolidColor:	 9.38	255	244	228
SolidColor:	 9.43	255	245	230
SolidColor:	 9.48	255	246	232
SolidColor:	 9.52	255	247	235
SolidColor:	 9.57	255	248	237
SolidColor:	 9.62	255	249	240
SolidColor:	 9.67	255	250	242
SolidColor:	 9.71	255	251	245
SolidColor:	 9.76	255	252	247
SolidColor:	 9.81	255	253	250
SolidColor:	 9.86	255	254	252
SolidColor:	 9.90	255	255	255
SolidColor:	 9.95	255	255	255`

const vertically_integrated_liquid = {
    colors: [
        'rgb(132, 132, 132)',
        'rgb(8, 183, 183)',
        'rgb(19, 14, 146)',

        'rgb(4, 204, 27)',
        'rgb(4, 100, 4)',

        'rgb(204, 193, 2)',
        'rgb(183, 107, 0)',

        'rgb(230, 31, 5)',
        'rgb(133, 14, 52)',

        'rgb(168, 0, 101)',
        'rgb(219, 152, 193)',

        'rgb(255, 254, 255)',
        'rgb(187, 188, 188)'
    ],
    values: [
        0, 4, 17,
        17, 30,
        30, 43,
        43, 56,
        56, 71,
        71, 79.5
    ],
}

/**
 * This is the main object that contains
 * the colormaps for all products.
 */
const product_colors = {
    range_folded: range_folded,
    range_folded_val: range_folded_val,

    DVL: vertically_integrated_liquid,
    HHC: colortable_parser(hydrometer_class),

    N0B: colortable_parser(reflectivity),
    N1B: colortable_parser(reflectivity),
    N2B: colortable_parser(reflectivity),
    N3B: colortable_parser(reflectivity),

    N0C: colortable_parser(corr_coeff),
    N1C: colortable_parser(corr_coeff),
    N2C: colortable_parser(corr_coeff),
    N3C: colortable_parser(corr_coeff),

    N0G: colortable_parser(velocity),
    N1G: colortable_parser(velocity),
    N2G: colortable_parser(velocity),
    N3G: colortable_parser(velocity),
    NAG: colortable_parser(velocity),
    NBG: colortable_parser(velocity),

    N0H: colortable_parser(hydrometer_class),
    N1H: colortable_parser(hydrometer_class),
    N2H: colortable_parser(hydrometer_class),
    N3H: colortable_parser(hydrometer_class),

    N0S: {
        colors: [
            'rgb(155, 31, 139)',
            'rgb(155, 31, 139)',

            'rgb(48, 7, 147)',
            'rgb(48, 7, 147)',

            'rgb(64, 128, 189)',
            'rgb(64, 128, 189)',

            'rgb(133, 226, 231)',
            'rgb(133, 226, 231)',

            'rgb(163, 240, 186)',
            'rgb(163, 240, 186)',

            'rgb(96, 209, 62)',
            'rgb(96, 209, 62)',

            'rgb(56, 127, 33)',
            'rgb(56, 127, 33)',

            'rgb(117, 131, 114)',
            'rgb(117, 131, 114)',

            'rgb(121, 21, 13)',
            'rgb(121, 21, 13)',

            'rgb(201, 43, 30)',
            'rgb(201, 43, 30)',

            'rgb(235, 123, 169)',
            'rgb(235, 123, 169)',

            'rgb(251, 229, 166)',
            'rgb(251, 229, 166)',

            'rgb(242, 162, 103)',
            'rgb(242, 162, 103)',

            'rgb(196, 104, 67)',
            'rgb(196, 104, 67)',

            'rgb(115, 20, 198)',
            'rgb(115, 20, 198)'
        ],
        values: [
            1, 2,
            2, 3,
            3, 4,
            4, 5,
            5, 6,
            6, 7,
            7, 8,
            8, 9,
            9, 10,
            10, 11,
            11, 12,
            12, 13,
            13, 14,
            14, 15,
            15, 16
        ],
    },
    N0U: colortable_parser(velocity),
    N1U: colortable_parser(velocity),
    N2U: colortable_parser(velocity),
    N3U: colortable_parser(velocity),

    N0X: colortable_parser(diff_reflectivity),
    N1X: colortable_parser(diff_reflectivity),
    N2X: colortable_parser(diff_reflectivity),
    N3X: colortable_parser(diff_reflectivity),

    NSW: spectrum_width,

    N0Q: colortable_parser(reflectivity),
    N1Q: colortable_parser(reflectivity),
    N2Q: colortable_parser(reflectivity),
    N3Q: colortable_parser(reflectivity),

    PHI: {
        colors: [
            'rgb(255, 255, 255)',
            'rgb(210, 210, 180)',
            'rgb(10, 20, 95)',
            'rgb(0, 255, 0)',
            'rgb(30, 100, 0)',
            'rgb(255, 255, 0)',
            'rgb(255, 125, 0)',
            'rgb(90, 0, 0)',
            'rgb(255, 140, 255)'
        ],
        values: [
            0, 15, 30, 45, 60, 75, 90, 120, 180
        ],
    },
    REF: colortable_parser(reflectivity),
    RHO: colortable_parser(corr_coeff),
    SW: spectrum_width, // 'SW '

    TV0: colortable_parser(velocity),
    TV1: colortable_parser(velocity),
    TV2: colortable_parser(velocity),

    TZL: colortable_parser(reflectivity),
    TZ0: colortable_parser(reflectivity),
    TZ1: colortable_parser(reflectivity),
    TZ2: colortable_parser(reflectivity),
    TZ3: colortable_parser(reflectivity),

    VEL: colortable_parser(velocity),
    ZDR: colortable_parser(diff_reflectivity),

    N0K: colortable_parser(specific_differential_phase),
    N1K: colortable_parser(specific_differential_phase),
    N2K: colortable_parser(specific_differential_phase),
    N3K: colortable_parser(specific_differential_phase),


    // these are for the colortable menu
    REF1: colortable_parser(reflectivity),
    REF2: colortable_parser(reflectivity_radarscope),
    VEL1: colortable_parser(velocity),
    VEL2: {
        colors: [
            'rgb(24, 28, 67)', // -120
            'rgb(41, 56, 136)', // -100
            'rgb(12, 94, 190)', // -80
            'rgb(56, 136, 186)', // -60
            'rgb(117, 170, 190)', // -40
            'rgb(182, 201, 207)', // -20
            'rgb(241, 236, 235)', // 0
            'rgb(223, 187, 176)', // 20
            'rgb(208, 139, 115)', // 40
            'rgb(191, 87, 58)', // 60
            'rgb(165, 33, 37)', // 80
            'rgb(115, 14, 39)', // 100
            'rgb(60, 9, 18)' // 120
        ],
        values: [
            -120, -100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100, 120
        ],
    },
}

module.exports = product_colors;