import numpy as np
import pandas as pd
import sqlite3
import json
import joblib
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
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

    
# Função principal para realizar o teste com t-SNE
def perform_tsne_with_grid_search(X, y, n_components, param_grid, output_file):
    
    # Dividir os dados em treinamento, validação e teste
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Aplicar undersampling no conjunto de treinamento
    undersampler = RandomUnderSampler(random_state=42)
    X_train_bal, y_train_bal = undersampler.fit_resample(X_train, y_train)
    scaler = StandardScaler()
    X_train_bal = scaler.fit_transform(X_train_bal)
    y_train_bal = scaler.transform(y_train_bal)

    # Criar ou abrir o arquivo CSV
    with open(output_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            "components", "CrossVal_Accuracy", "Validation_Accuracy", "Test_Accuracy",
            "Precision", "Recall", "F1_Score", "AUC_ROC"
        ])

    # Iterar sobre os valores de perplexidade do t-SNE
    for component in n_components:
        random_state = np.random.randint(0, 10000) 
        print(f"Testando t-SNE com componentes {component}...")

        # Aplicar t-SNE ao conjunto de treinamento, validação e teste
        tsne = TSNE(n_components=component,random_state=random_state)
        X_train_tsne = tsne.fit_transform(X_train_bal)
        X_val_tsne = tsne.fit_transform(X_val)
        X_test_tsne = tsne.fit_transform(X_test)

        # Configurar o modelo e realizar o cross-validation com grid search
        rf = RandomForestClassifier(random_state=random_state)
        grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=5, scoring='accuracy', n_jobs=-1)

        print("Executando Grid Search com Cross-Validation...")
        grid_search.fit(X_train_tsne, y_train_bal)

        best_params = grid_search.best_params_
        print(f"Melhores parâmetros encontrados: {best_params}")

        # Treinar o modelo com os melhores parâmetros
        final_model = RandomForestClassifier(random_state=random_state, **best_params)
        final_model.fit(X_train_tsne, y_train_bal)

        # Avaliar o modelo no conjunto de validação
        val_predictions = final_model.predict(X_val_tsne)
        val_probabilities = final_model.predict_proba(X_val_tsne)[:, 1]

        val_accuracy = accuracy_score(y_val, val_predictions)
        val_precision = precision_score(y_val, val_predictions, zero_division=0)
        val_recall = recall_score(y_val, val_predictions)
        val_f1 = f1_score(y_val, val_predictions)
        val_roc_auc = roc_auc_score(y_val, val_probabilities)

        # Avaliar o modelo no conjunto de teste
        test_predictions = final_model.predict(X_test_tsne)
        test_probabilities = final_model.predict_proba(X_test_tsne)[:, 1]

        test_accuracy = accuracy_score(y_test, test_predictions)
        test_precision = precision_score(y_test, test_predictions, zero_division=0)
        test_recall = recall_score(y_test, test_predictions)
        test_f1 = f1_score(y_test, test_predictions)
        test_roc_auc = roc_auc_score(y_test, test_probabilities)

        print(f"Validação com componentes {component}:")
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
                component, grid_search.best_score_, val_accuracy, test_accuracy,
                test_precision, test_recall, test_f1, test_roc_auc, val_conf_matrix.tolist(), test_conf_matrix.tolist()
            ])


# Fluxo principal
if __name__ == "__main__":
    # Carregar os dados (substituir pelo seu dataset)
    X, y = readFromDB('[BD]GOLD.db')

    # Lista de perplexidade a serem testadas
    # perplexity_list = [5, 10, 20, 30, 40, 50]
    n_components = [2, 3]#2 melhor2

    # Grid de parâmetros para o Random Forest
    param_grid = {
        'n_estimators': [100],
        'max_depth': [None],
        'min_samples_split': [2],
        'max_features': [None],
        'min_samples_leaf': [1]
    }

    # Nome do arquivo CSV para salvar os resultados
    output_file = "AG_DOUTORADO_RESULTS_TSNE_EXP3.csv"

    # Executar o teste com t-SNE e grid search
    perform_tsne_with_grid_search(X, y, n_components, param_grid, output_file)

