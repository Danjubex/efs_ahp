import numpy as np
import pandas as pd
import sqlite3
import json
import joblib
from sklearn.linear_model import LassoCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score
)
from sklearn.model_selection import train_test_split, GridSearchCV
from imblearn.under_sampling import RandomUnderSampler
import csv
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

    
# Função principal para realizar o teste com LASSO
def perform_rf_feature_selection_with_grid_search(X, y, param_grid, output_file, run_id, random_state):
    # Dividir os dados em treinamento, validação e teste
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=random_state)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=random_state)

    # Aplicar undersampling no conjunto de treinamento
    undersampler = RandomUnderSampler(random_state=random_state)
    X_train_bal, y_train_bal = undersampler.fit_resample(X_train, y_train)
    scaler = StandardScaler()
    X_train_bal = scaler.fit_transform(X_train_bal)
    y_train_bal = scaler.transform(y_train_bal)

    # Seleção de features usando Random Forest
    print("Realizando seleção de features com Random Forest...")
    selector_rf = RandomForestClassifier(random_state=random_state, n_estimators=100)
    selector_rf.fit(X_train_bal, y_train_bal)
    #feature_importances = selector_rf.feature_importances_
    #selected_features = np.where(feature_importances > np.mean(feature_importances))[0]  # Selecionar features acima da média
    # Definir um limiar para seleção (pode ser absoluto ou relativo)
    limiar = [0,	0.01,	0.025,	0.05] #0.01 melhor
    
    # Selecionar features acima do limiar
    selected_features = np.where(feature_importances > threshold)[0]  # Indices das features selecionadas

    print(f"Número de features selecionadas: {len(selected_features)}")

    # Filtrar os conjuntos de dados para as features selecionadas
    X_train_selected = X_train_bal[:, selected_features]
    X_val_selected = X_val[:, selected_features]
    X_test_selected = X_test[:, selected_features]

    # Configurar o modelo e realizar o grid search
    rf = RandomForestClassifier(random_state=random_state)
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=5, scoring='accuracy', n_jobs=-1)

    print("Executando Grid Search com Cross-Validation...")
    grid_search.fit(X_train_selected, y_train_bal)

    best_params = grid_search.best_params_
    print(f"Melhores parâmetros encontrados: {best_params}")

    # Treinar o modelo com os melhores parâmetros
    final_model = RandomForestClassifier(random_state=random_state, **best_params)
    final_model.fit(X_train_selected, y_train_bal)

    # Avaliar o modelo no conjunto de validação
    val_predictions = final_model.predict(X_val_selected)
    val_probabilities = final_model.predict_proba(X_val_selected)[:, 1]

    val_accuracy = accuracy_score(y_val, val_predictions)
    val_precision = precision_score(y_val, val_predictions, zero_division=0)
    val_recall = recall_score(y_val, val_predictions)
    val_f1 = f1_score(y_val, val_predictions)
    val_roc_auc = roc_auc_score(y_val, val_probabilities)

    # Avaliar o modelo no conjunto de teste
    test_predictions = final_model.predict(X_test_selected)
    test_probabilities = final_model.predict_proba(X_test_selected)[:, 1]

    test_accuracy = accuracy_score(y_test, test_predictions)
    test_precision = precision_score(y_test, test_predictions, zero_division=0)
    test_recall = recall_score(y_test, test_predictions)
    test_f1 = f1_score(y_test, test_predictions)
    test_roc_auc = roc_auc_score(y_test, test_probabilities)

    print(f"Resultados da Rodada {run_id}:")
    print(f"  Cross-Validation Acurácia: {grid_search.best_score_:.4f}")
    print(f"  Validação Acurácia: {val_accuracy:.4f}")
    print(f"  Teste Acurácia: {test_accuracy:.4f}")
    print(f"  Precision: {test_precision:.4f}")
    print(f"  Recall: {test_recall:.4f}")
    print(f"  F1-Score: {test_f1:.4f}")
    print(f"  AUC-ROC: {test_roc_auc:.4f}")
    print(f"  Matriz de Confusão (Validação):\n{val_conf_matrix}")
    print(f"  Matriz de Confusão (Teste):\n{test_conf_matrix}")

    # Salvar os resultados no arquivo CSV
    with open(output_file, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            run_id, len(selected_features), grid_search.best_score_, val_accuracy, test_accuracy,
            test_precision, test_recall, test_f1, test_roc_auc, val_conf_matrix.tolist(), test_conf_matrix.tolist()
        ])


# Fluxo Principal
if __name__ == "__main__":
    X, y = readFromDB('[BD]GOLD.db')

    param_grid = {
        'n_estimators': [100],
        'max_depth': [None],
        'min_samples_split': [2],
        'max_features': [None],
        'min_samples_leaf': [1]
    }

    output_file = "AG_DOUTORADO_RESULTS_RF_FEATURE_IMPORTANCE_EXP3.csv"

    # Criar ou abrir o arquivo CSV
    with open(output_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            "Run_ID", "Num_Selected_Features", "CrossVal_Accuracy", "Validation_Accuracy",
            "Test_Accuracy", "Precision", "Recall", "F1_Score", "AUC_ROC"
        ])

    # Executar o processo 10 vezes com variabilidade
    for run_id in range(1, 11):
        random_state = np.random.randint(0, 10000)  # Gerar um estado aleatório diferente a cada rodada
        print(f"\nExecutando rodada {run_id} com random_state={random_state}...")
        perform_rf_feature_selection_with_grid_search(
            X, y, param_grid, output_file, run_id, random_state
        )





