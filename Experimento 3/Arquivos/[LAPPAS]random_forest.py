import numpy as np
import pandas as pd
import time
import csv
import sqlite3
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import  roc_auc_score, classification_report
from sklearn.model_selection import train_test_split, cross_val_score
from deap import base, creator, tools, algorithms
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from imblearn.under_sampling import RandomUnderSampler
import random
import json
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.impute import SimpleImputer

#[OK] TRAIN, VALIDATION, TEST OK
#[OK] GRID SEARCH 
#[OK] CROSS VALIDATION
#SMOTE 
#REGULARIZATION L1, L2
#NORMALIZAR 



#features escolhidos
features = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,35,36,37,38,42,43,
44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,64,65,66,68,69,70,
71,72,73,74,75,76,77,78,79,80,81,82,86,87,88,89,90,91,92,93,94,95,96,
97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,115,118,121,133,
134,137,138,141,142,145,146,173,174,175,176,180,181,184,185,186,187,188,
189,192,193,196,197,198,199,200,201,202,203,207,208,209,210,211,212,213,214,215,216,
217,218,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,261,262,263,
264,265,266,267,268,269,270,271,272,285,286,287,288,289,290,291,292,305,306,
307,308,309,310,311,312,325,326,327,328,329,330,331,332,345,346,347,348,349,350,
351,352,441,442,443,444,445,458]

# Definir pesos maiores para a Classe 0
class_weights = 'balanced'#{0: 3, 1: 0}  # Exemplo: Classe 0 terá o dobro de peso em relação à Classe 1
csv_file = "AG_DOUTORADO_RESULTS_CONCORRENTE_EXP3.csv"
moeda = 'GOLD'
tipo  = 'COMPRA'


# Grupos de variáveis baseados no exemplo
GROUPS = {
    "PERIODOS": list(range(0, 34)),  
    "MEDIAS_SIMPLES_FECHAMENTO": list(range(35, 42)),  
    "MEDIA_MOVEL_FECHAMENTO": list(range(42, 57)),  
    "MEDIA_SIMPLES_VOLUME": list(range(57, 64)),  
    "MEDIA_MOVEL_VOLUME": list(range(64, 79)),  
    "RSI": list(range(79, 86)),  
    "MACD": list(range(86, 112)),  
    "BOLLINGER": list(range(112, 133)),  
    "OSCILADOR_ESTOCASTICO": list(range(133, 173)),  
    "MMP": list(range(173, 180)),  
    "ADX": list(range(207, 231)),  
    "PVI": list(range(231, 261)),  
    "SAR": list(range(261, 285)),  
    "FIBONNACI": list(range(285, 425)),  
    "TRIPPLE_RSI": list(range(425, 442)),  
    "MFI": list(range(442, 449)),  
    "TRIPPLE_MFI": list(range(449, 465)),  
}

def feature_selection():

    # Lista para armazenar as features selecionadas
    selected_features = []

    # Iterar sobre o vetor de features e decidir aleatoriamente se cada uma será selecionada
    for feature in features:
        if random.choice([True, False]):  # 50% de chance de selecionar cada feature
            selected_features.append(feature)
    # print('selected_features',selected_features)
    return selected_features


def load_data_from_json(file_path, tipo='COMPRA'):
    with open(file_path, 'r') as file:
        data = json.load(file)
    df = pd.DataFrame(data)
    df = df.sample(2500)
    
    # Definir colunas a serem descartadas
    columns_to_drop = ['min_onde_perdeu', 'min_onde_ganhou', 'total_ganhou', 'total_perdeu', 
                       'min_onde_perdeu_V', 'min_onde_ganhou_V', 'total_ganhou_V', 'total_perdeu_V', 'hora']
    
    # Ajustar com base no tipo
    if tipo == 'COMPRA':
        columns_to_drop.append('perdeu_ganhou_V')
        target_column = 'perdeu_ganhou'
    elif tipo == 'VENDA':
        columns_to_drop.append('perdeu_ganhou')
        target_column = 'perdeu_ganhou_V'
    else:
        raise ValueError("O parâmetro 'tipo' deve ser 'COMPRA' ou 'VENDA'.")

    # Remover colunas desnecessárias
    df = df.drop(columns=columns_to_drop, errors='ignore')
    df = df.dropna(axis=0)
    # Mostrar a distribuição do target antes do mapeamento
    print(file_path, f"Distribuição de '{target_column}' antes do mapeamento:")
    print(df[target_column].value_counts(dropna=False))
    
    # Mapear as categorias para valores numéricos
    category_mapping = {'GANHOU': 1, 'PERDEU': 0, np.nan: 2}
    df[target_column] = df[target_column].map(category_mapping)
    
    # Converter colunas categóricas para variáveis dummy
    df = pd.get_dummies(df, drop_first=True)
    
    # Separar as features (X) e o target (y)
    X = df.drop(columns=[target_column]).values
    y = df[target_column].values
    
    return X, y

def readFromDB(db_path, tipo='COMPRA'):
    # Conectar ao banco de dados SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Selecionar a coluna JSON da tabela `dados`
    cursor.execute("SELECT dados FROM dados WHERE data > '2014.10.19 20:00:00' LIMIT 1500000")
    rows = cursor.fetchall()
    print("Extraindo dados do SQLite...")
    
    # Extrair o conteúdo JSON de cada linha e carregar em uma lista de dados
    data = [json.loads(row[0]) for row in rows]
    print("Dados extraídos com sucesso!")
    
    # Fechar a conexão
    conn.close()
    
    # Converter a lista de dados em um DataFrame
    df = pd.DataFrame(data)
    print(df.sample())
    
    # Definir colunas a serem descartadas
    columns_to_drop = ['min_onde_perdeu', 'min_onde_ganhou', 'total_ganhou', 'total_perdeu', 
                       'min_onde_perdeu_V', 'min_onde_ganhou_V', 'total_ganhou_V', 'total_perdeu_V', 'hora']
    
    # Ajustar com base no tipo
    if tipo == 'COMPRA':
        columns_to_drop.append('perdeu_ganhou_V')
        target_column = 'perdeu_ganhou'
    elif tipo == 'VENDA':
        columns_to_drop.append('perdeu_ganhou')
        target_column = 'perdeu_ganhou_V'
    else:
        raise ValueError("O parâmetro 'tipo' deve ser 'COMPRA' ou 'VENDA'.")

    # Remover colunas desnecessárias
    df = df.drop(columns=columns_to_drop, errors='ignore')
    df = df.dropna(axis=0)

    # Mostrar a distribuição do target antes do mapeamento
    print(db_path, f"Distribuição de '{target_column}' antes do mapeamento:")
    print(df[target_column].value_counts(dropna=False))
    
    # Mapear as categorias para valores numéricos
    category_mapping = {'GANHOU': 1, 'PERDEU': 0, np.nan: 2}
    df[target_column] = df[target_column].map(category_mapping)
    
    # Converter colunas categóricas para variáveis dummy
    df = pd.get_dummies(df, drop_first=True)
    
    # Separar as features (X) e o target (y)
    X = df.drop(columns=[target_column]).values
    y = df[target_column].values
    
    # Dividir em 90% para treinamento e 10% para teste
    #split_index = int(0.1 * len(X))
    #X_test, y_test = X[:split_index], y[:split_index]
    #X_train, y_train = X[split_index:], y[split_index:]
    
    print(f"Tamanho do conjunto de treinamento: {X.shape[0]} amostras")
    print(f"Tamanho do conjunto de teste: {y.shape[0]} amostras")
    
    return X, y 

def evaluate_individual_by_group(individual, X, y, X_val, y_val, cv_folds=5, best_params=None):
    # Certifique-se de que os melhores parâmetros do Grid Search estão disponíveis
    if best_params is None:
        raise ValueError("Os melhores parâmetros do Grid Search precisam ser fornecidos.")
    
    # Configurar o modelo com os melhores parâmetros do Grid Search
    n_estimators = best_params['n_estimators']
    max_depth = best_params['max_depth']
    min_samples_split = best_params['min_samples_split']
    max_features = best_params['max_features']
    min_samples_leaf = best_params['min_samples_leaf']

    selected_features = feature_selection()
    individual[:-5] = selected_features

    if len(selected_features) == 0:
        return (0.0,)  # Penalizar indivíduos sem features selecionadas

    # Configurar o modelo com as features selecionadas
    model = RandomForestClassifier(
        random_state=42,
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        max_features=max_features,
        min_samples_leaf=min_samples_leaf,
        class_weight=class_weights
    )

    # Treinar o modelo com o conjunto de treino
    model.fit(X[:, selected_features], y)

    # Realizar cross-validation usando o conjunto de validação
    scores = cross_val_score(
        model, 
        X_val[:, selected_features], 
        y_val, 
        cv=cv_folds, 
        scoring='accuracy'  # Accuracy como métrica principal
    )
    
    return (np.mean(scores),)



    
def create_toolbox_group_selection(X, y, X_val, y_val,  num_features,best_params=None):
    creator.create("FitnessMax", base.Fitness, weights=(1.0,))
    creator.create("Individual", list, fitness=creator.FitnessMax)
    toolbox = base.Toolbox()
    toolbox.register("attr_bool", random.randint, 0, 1)
    toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_bool, n=num_features)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)
    toolbox.register("evaluate", evaluate_individual_by_group, X=X, y=y,X_val= X_val,y_val = y_val,cv_folds=5,best_params=best_params)
    toolbox.register("mate", tools.cxTwoPoint)
    toolbox.register("mutate", tools.mutFlipBit, indpb=0.05)
    toolbox.register("select", tools.selTournament, tournsize=3)
    return toolbox

def perform_grid_search(X_train, y_train):
    # param_grid = {
    #     'n_estimators': [50, 100, 200],
    #     'max_depth': [None, 10, 20],
    #     'min_samples_split': [2, 5, 10],
    #     'max_features': ['sqrt', 'log2', None],
    #     'min_samples_leaf': [1, 2, 4]
    # }
    param_grid = {
        'n_estimators': [100],
        'max_depth': [None],
        'min_samples_split': [2],
        'max_features': [None],
        'min_samples_leaf': [1]
    }
    rf = RandomForestClassifier(random_state=42, class_weight= class_weights)
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=5, scoring='accuracy', n_jobs=-1)#roc_auc

    print("Executando Grid Search...")
    grid_search.fit(X_train, y_train)

    print("Melhores parâmetros encontrados pelo Grid Search:")
    print(grid_search.best_params_)
    print(f"Melhor acurácia: {grid_search.best_score_}")

    return grid_search.best_params_

# Algoritmo Genético para selecionar features com os melhores hiperparâmetros
def genetic_algorithm(X_train, y_train, X_val, y_val, X_test, y_test, num_features, n_gen=50, pop_size=10, cx_prob=0.9, mut_prob=0.05, elitism_size=5, best_params=None):

    # Criar ou abrir o arquivo CSV
    with open(csv_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Cycle", "Generation", "Num_Features", "Selected_Features", "Accuracy", "Precision", "Recall", "F1_Score", "AUC_ROC", "Training_Time_Minutes"])

    for cycle in range(1, 11):  # Executar 10 ciclos
        print(f"\nIniciando Ciclo {cycle}...")
        toolbox = create_toolbox_group_selection(X_train, y_train, X_val, y_val, num_features, best_params)
        population = toolbox.population(n=pop_size)

        # Avaliar a aptidão dos indivíduos
        fitnesses = list(map(toolbox.evaluate, population))
        for ind, fit in zip(population, fitnesses):
            ind.fitness.values = fit

        hof = tools.HallOfFame(elitism_size)
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean)
        stats.register("std", np.std)
        stats.register("min", np.min)
        stats.register("max", np.max)

        for gen in range(n_gen):
            start_time = time.time()  # Iniciar a medição do tempo

            offspring = toolbox.select(population, len(population) - elitism_size)
            offspring = list(map(toolbox.clone, offspring))

            # Aplicar crossover e mutação
            for child1, child2 in zip(offspring[::2], offspring[1::2]):
                if random.random() < cx_prob:
                    toolbox.mate(child1, child2)
                    del child1.fitness.values
                    del child2.fitness.values

            for mutant in offspring:
                if random.random() < mut_prob:
                    toolbox.mutate(mutant)
                    del mutant.fitness.values

            # Avaliar indivíduos alterados
            invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
            fitnesses = map(toolbox.evaluate, invalid_ind)
            for ind, fit in zip(invalid_ind, fitnesses):
                ind.fitness.values = fit

            # Preservar elitismo
            population[:] = offspring + tools.selBest(population, elitism_size)

            # Atualizar Hall of Fame
            hof.update(population)

            # Melhor indivíduo da geração atual
            best_individual = hof[0]
            selected_features = best_individual[:-5]

            if len(selected_features) == 0:
                print(f"Ciclo {cycle}, Geração {gen + 1}: Nenhuma feature selecionada.")
                continue

            # Treinar modelo no conjunto de treino
            model = RandomForestClassifier(random_state=42, **best_params)
            model.fit(X_train[:, selected_features], y_train)

            # Previsões e métricas no conjunto de validação
            test_predictions = model.predict(X_test[:, selected_features])
            test_probabilities = model.predict_proba(X_test[:, selected_features])[:, 1]  # Apenas probabilidade para a classe positiva

            test_accuracy = accuracy_score(y_test, test_predictions)
            test_precision = precision_score(y_test, test_predictions, zero_division=0)
            test_recall = recall_score(y_test, test_predictions)
            test_f1 = f1_score(y_test, test_predictions)
            test_roc_auc = roc_auc_score(y_test, test_probabilities)  # Probabilidades para a classe positiva

            end_time = time.time()  # Parar a medição do tempo
            training_time_minutes = (end_time - start_time) / 60  # Tempo em minutos

            print(f"Ciclo {cycle}, Validação (Geração {gen + 1}):")
            print(f"  Acurácia: {test_accuracy:.4f}")
            print(f"  Precision: {test_precision:.4f}")
            print(f"  Recall: {test_recall:.4f}")
            print(f"  F1-Score: {test_f1:.4f}")
            print(f"  AUC-ROC: {test_roc_auc:.4f}")
            print(f"  Tempo de Treinamento: {training_time_minutes:.2f} minutos")

            # Salvar os resultados no CSV
            with open(csv_file, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([cycle, gen + 1, len(selected_features), selected_features, test_accuracy, test_precision, test_recall, test_f1, test_roc_auc, training_time_minutes])

        print(f"Ciclo {cycle} concluído.")

    print("Execução dos ciclos finalizada.")



# Fluxo Principal
if __name__ == "__main__":
    # Carregar dados (exemplo)
    # X, y = load_data_from_json("[ALEA]BTCUSD.json")
    # X, y = load_data_from_json("[ULTIMOS_60]GOLD.json")
    X, y = readFromDB('[BD]GOLD.db')

    # Dividir dados em treino, validação e teste
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Aplicar SMOTE no conjunto de treino
    # smote = SMOTE(random_state=42)
    # X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
    # Realizar o undersampling da classe majoritária
    rus = RandomUnderSampler(random_state=42)
    X_train_bal, y_train_bal = rus.fit_resample(X_train, y_train)

    print("Distribuição de classes após SMOTE:")
    print(pd.Series(y_train_bal).value_counts())

    # Criar um pipeline de normalização e regularização
    scaler = StandardScaler()

    # # Regularização L1 e L2
    # regularization_pipeline = Pipeline([
    #     ("scaler", scaler),
    #     ("log_reg_l1", LogisticRegression(penalty="l1", solver="liblinear", max_iter=1000, random_state=42)),
    #     ("log_reg_l2", LogisticRegression(penalty="l2", solver="lbfgs", max_iter=1000, random_state=42))
    # ])

    # Normalizar os dados de validação e teste usando o mesmo escalador do treino
    X_val_normalized = scaler.fit_transform(X_val)
    X_test_normalized = scaler.transform(X_test)

    # X_val_normalized = X_val
    # X_test_normalized = X_test

    print("Dados normalizados para validação e teste")

    # Executar Grid Search
    best_params = perform_grid_search(X_train_bal, y_train_bal)

    # Executar Algoritmo Genético com os melhores parâmetros
    genetic_algorithm(X_train_bal, y_train_bal, X_val_normalized, y_val, X_test_normalized, y_test, num_features=X_train.shape[1], best_params=best_params)


# In[ ]:




