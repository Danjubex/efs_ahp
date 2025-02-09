import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import ttest_ind, mannwhitneyu, shapiro, wilcoxon
from scikit_posthocs import posthoc_dunn

# Carregar o arquivo CSV
data_path = "exp2.csv"  # Substitua pelo caminho correto
df = pd.read_csv(data_path, sep=';', decimal=',')

# Selecionar variáveis para análise
numeric_columns = ['atributos', 'R²', 'treinamento (min)']  # Variáveis de interesse
group_column = 'algoritmo'  # Coluna para agrupamento

# Ordem personalizada dos algoritmos
custom_order = [
    "CORRELATION", "[RF]FEATURE IMPORTANCE",
    "LASSO", "TSNE", "UMAP",
    "PCA", "RANDOM SEARCH",  "LAPPAS & YANNACOPOULOS", "[EFS-AHP]GPT", "[EFS-AHP]DEC 1"

]

# Ajustar a ordem no DataFrame
df[group_column] = pd.Categorical(df[group_column], categories=custom_order, ordered=True)

# Inicializar lista para resultados
analysis_results = []
wilcoxon_results = {}
ttest_results = {}
mannwhitney_results = {}

# Realizar testes para cada variável numérica
for column in numeric_columns:
    grouped_data = df.groupby(group_column)[column]

    # Verificar normalidade em cada grupo
    normality_results = {}
    for group_name, group_data in grouped_data:
        if len(group_data) >= 3:  # Shapiro exige ao menos 3 dados
            stat, pval = shapiro(group_data)
            normality_results[group_name] = "Normal" if pval > 0.05 else "Não Normal"
        else:
            normality_results[group_name] = "Dados insuficientes"

    # Decidir se os dados seguem distribuição normal
    follows_normal = all(val == "Normal" for val in normality_results.values())

    # Teste t de Student ou Mann-Whitney U para cada par
    comparison_matrix_ttest = pd.DataFrame(index=custom_order, columns=custom_order)
    comparison_matrix_mannwhitney = pd.DataFrame(index=custom_order, columns=custom_order)

    for alg1 in custom_order:
        for alg2 in custom_order:
            if alg1 != alg2:
                data1 = df[df[group_column] == alg1][column].dropna()
                data2 = df[df[group_column] == alg2][column].dropna()
                if len(data1) > 0 and len(data2) > 0:
                    # Teste t para dados normais
                    if follows_normal:
                        try:
                            stat, pval = ttest_ind(data1, data2, equal_var=False)
                            comparison_matrix_ttest.loc[alg1, alg2] = pval
                        except Exception as e:
                            comparison_matrix_ttest.loc[alg1, alg2] = f"Erro: {e}"
                    # Teste de Mann-Whitney U para dados não normais
                    else:
                        try:
                            stat, pval = mannwhitneyu(data1, data2, alternative='two-sided')
                            comparison_matrix_mannwhitney.loc[alg1, alg2] = pval
                        except Exception as e:
                            comparison_matrix_mannwhitney.loc[alg1, alg2] = f"Erro: {e}"

    if follows_normal:
        ttest_results[column] = comparison_matrix_ttest
        comparison_matrix_ttest.to_csv(f"[EXP2]ttest_{column}.csv")
    else:
        mannwhitney_results[column] = comparison_matrix_mannwhitney
        comparison_matrix_mannwhitney.to_csv(f"[EXP2]mannwhitney_{column}.csv")


    # Post-hoc Wilcoxon Test
    wilcoxon_matrix = pd.DataFrame(index=custom_order, columns=custom_order)
    for alg1 in custom_order:
        for alg2 in custom_order:
            if alg1 != alg2:
                data1 = df[df[group_column] == alg1][column].dropna()
                data2 = df[df[group_column] == alg2][column].dropna()
                if len(data1) > 0 and len(data2) > 0 and len(data1) == len(data2) and not (data1.reset_index(drop=True) == data2.reset_index(drop=True)).all():
                    try:
                        stat, pval = wilcoxon(data1, data2)
                        wilcoxon_matrix.loc[alg1, alg2] = pval
                    except Exception as e:
                        wilcoxon_matrix.loc[alg1, alg2] = f"Erro: {e}"
                else:
                    wilcoxon_matrix.loc[alg1, alg2] = "Dados incompatíveis"
    wilcoxon_results[column] = wilcoxon_matrix
    wilcoxon_matrix.to_csv(f"[EXP2]wilcoxon_{column}.csv")

    # Criar boxplot
    plt.figure(figsize=(40, 6))
    df.boxplot(column=column, by=group_column, grid=True, vert=False)
    plt.title(f"Distribuição de {column}")
    plt.suptitle("")
    plt.xlabel(column)
    plt.ylabel("Algoritmo")
    plt.tight_layout()
    plt.savefig(f"[EXP2]boxplot_{column}.png")
    plt.show()

    # Armazenar resultados na análise estatística
    analysis_results.append({
        'Variável': column,
        'Segue Normalidade': follows_normal,
        'Resultado T-Test': "Executado" if follows_normal else "Não Executado",
        'Resultado Mann-Whitney': "Executado" if not follows_normal else "Não Executado",
        'Normalidade': normality_results
    })

# Salvar resultados em arquivos
for column, wilcoxon_matrix in wilcoxon_results.items():
    if wilcoxon_matrix is not None:
        wilcoxon_matrix.to_csv(f"[EXP2]wilcoxon_{column}.csv")

for column, ttest_matrix in ttest_results.items():
    if ttest_matrix is not None:
        ttest_matrix.to_csv(f"[EXP2]ttest_{column}.csv")

for column, mannwhitney_matrix in mannwhitney_results.items():
    if mannwhitney_matrix is not None:
        mannwhitney_matrix.to_csv(f"[EXP2]mannwhitney_{column}.csv")

# Salvar análise estatística
analysis_df = pd.DataFrame(analysis_results)
analysis_df.to_csv("[EXP2]analise_estatistica.csv", index=False)

# Exibir resultados da análise estatística
print("\nResultados da análise estatística:")
print(analysis_df)
